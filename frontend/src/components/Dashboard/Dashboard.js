/* eslint-disable no-unused-vars */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { auth, db, logout } from '../../firebase';
import { query, collection, getDocs, where } from 'firebase/firestore';
import { Camera } from 'react-camera-pro';
import '@tensorflow/tfjs';
import * as facemesh from '@tensorflow-models/face-landmarks-detection';
// import Webcam from 'react-webcam';
// import Camera from '../CameraV2';
import { drawMesh } from '../../utils';
// Adds the CPU backend.
import '@tensorflow/tfjs-backend-cpu';
import * as tf from '@tensorflow/tfjs-core';
import * as tflite from '@tensorflow/tfjs-tflite';

import styles from './Dashboard.module.scss';

function Dashboard() {
  const [name, setName] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cardImage, setCardImage] = useState();
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const camera = useRef(null);
  const [devices, setDevices] = useState([]);
  const [image, setImage] = useState(null);

  // console.log('cardimage', cardImage);

  const fetchUserName = async () => {
    try {
      const q = query(collection(db, 'users'), where('uid', '==', user?.uid));
      const doc = await getDocs(q);
      const data = doc.docs[0].data();
      setName(data.name);
    } catch (err) {
      console.error(err);
      console.log('An error occured while fetching user data');
    }
  };

  const functionPredict = async function () {
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
    if (loading) return;
    if (!user) return navigate('/');
    fetchUserName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  useEffect(() => {
    (async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((i) => i.kind == 'videoinput');
      console.log(videoDevices);
      setDevices(videoDevices);
    })();
  }, []);

  //don't remove this
  // useEffect(() => {
  //   runFacemesh();
  // }, [runFacemesh]);

  return (
    <div className={styles.dashboard}>
      <nav className={styles.navbar}>
        {/* <p>{name}</p> */}
        <p>Logged in as {user?.email}</p>
        <button className="dashboard__btn" onClick={logout}>
          Logout
        </button>
      </nav>

      {/* {functionPredict()} */}
      <div className={styles.container}>
        <div className={styles.main}>
          {/* <div className={styles.camera}> */}
          {/* <Webcam ref={webcamRef} className={styles.webcam} /> */}
          {/* <canvas ref={canvasRef} className={styles.canvas} /> */}
          {/* </div> */}

          {/* {isCameraOpen && (
            <Camera
              onCapture={(blob) => setCardImage(blob)}
              onClear={() => setCardImage(undefined)}
            />
          )}

          {cardImage && (
            <div>
              <h2>Preview</h2>
              <img
                src={cardImage && URL.createObjectURL(cardImage)}
                alt="preview"
              />
            </div>
          )}

          <div>
            <button onClick={() => setIsCameraOpen(true)}>Open Camera</button>
            <button
              onClick={() => {
                setIsCameraOpen(false);
                setCardImage(undefined);
              }}
            >
              Close Camera
            </button>
          </div> */}
          {/* <Camera /> */}
          {/* <div className={styles.camera}> */}
          <Camera ref={camera} />
          <button onClick={() => setImage(camera.current.takePhoto())}>
            Take photo
          </button>
          <img src={image} alt="Taken photo" />
          {/* </div> */}
        </div>
      </div>
    </div>
  );
}
export default Dashboard;
