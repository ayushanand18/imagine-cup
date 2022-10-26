import React, { useRef, useEffect, useCallback } from 'react';
import { createBrowserRouter, RouterProvider, Route } from 'react-router-dom';

import '@tensorflow/tfjs';
import * as facemesh from '@tensorflow-models/face-landmarks-detection';
import Webcam from 'react-webcam';

import { drawMesh } from './utils';
// Adds the CPU backend.
import '@tensorflow/tfjs-backend-cpu';
// Import @tensorflow/tfjs-core
import * as tf from '@tensorflow/tfjs-core';
// Import @tensorflow/tfjs-tflite.
import * as tflite from '@tensorflow/tfjs-tflite';

import './App.css';
import Dashboard from './Dashboard';
import Login from './Login';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
]);

function App() {
  var functionPredict = async function () {
    //
    // Function to infer from tflite model
    //
    // (sorry for the really dirty code.)

    const tfliteModel = await tflite.loadTFLiteModel('./assets/model.tflite');
    const im = new Image();
    im.src = 'assets/1-556.JPG';
    im.onload = () => {
      let img = tf.browser.fromPixels(im, 4);

      const outputTensor = tf.tidy(() => {
        // Get pixels data from an image.
        // or use below method to fetch from a DOM object
        // whatever image you take please have them in BGR format
        // let img = tf.browser.fromPixels(document.querySelector('img'));
        // Resize and normalize:
        img = tf.image.resizeBilinear(img, [224, 224]);
        img = tf.sub(tf.div(tf.expandDims(img), 127.5), 1);

        // Run the inference.
        let outputTensor = tfliteModel.predict(img);

        // De-normalize the result.
        return tf.mul(tf.add(outputTensor, 1), 127.5);
      });

      console.log(outputTensor);
    };
  };
  functionPredict();

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const runFacemesh = useCallback(async () => {
    const net = await facemesh.load(
      facemesh.SupportedPackages.mediapipeFacemesh
    );
    setInterval(() => {
      detect(net);
    }, 10);
  }, []);

  const detect = async (net) => {
    if (
      typeof webcamRef.current !== 'undefined' &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const face = await net.estimateFaces({ input: video });
      console.log(face);

      // Get canvas context
      const ctx = canvasRef.current.getContext('2d');
      requestAnimationFrame(() => {
        drawMesh(face, ctx);
      });
    }
  };

  useEffect(() => {
    runFacemesh();
  }, [runFacemesh]);

  return (
    <div className="App">
      <RouterProvider router={router} />
      {/* <header className="App-header">
        <Webcam
          ref={webcamRef}
          style={{
            position: 'absolute',
            marginLeft: 'auto',
            marginRight: 'auto',
            left: 0,
            right: 0,
            textAlign: 'center',
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            marginLeft: 'auto',
            marginRight: 'auto',
            left: 0,
            right: 0,
            textAlign: 'center',
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />
      </header> */}
    </div>
  );
}

export default App;
