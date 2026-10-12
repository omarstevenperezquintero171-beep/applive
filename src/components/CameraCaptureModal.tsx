// src/components/CameraCaptureModal.tsx
'use client';

import { useState, useRef, useEffect } from 'react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (photoDataUrl: string) => void;
}

export default function CameraCaptureModal({ isOpen, onClose, onCapture }: CameraCaptureModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setCapturedImage(null);
      setCountdown(null);
      setCameraError(null);
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Error al acceder a la cámara:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Permiso de cámara denegado. Permite el acceso a la cámara en tu navegador.'
          : 'No se pudo acceder a la cámara o no hay dispositivos disponibles.'
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleTakeSnapshot = () => {
    // 3 second countdown for a great user experience
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          executeCapture();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const executeCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use vertical 9:16 crop or aspect matching video
    const w = video.videoWidth || 720;
    const h = video.videoHeight || 1280;

    canvas.width = w;
    canvas.height = h;

    // Mirror image for front camera
    if (facingMode === 'user') {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div
        className="modal-card"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 520, width: '95%', padding: '24px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 24 }}>📸</span>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800 }}>Tomar Foto con Cámara</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Posiciónate en el centro con buena iluminación para animar tu avatar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: 20,
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        {/* Viewport Box */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: 380,
            borderRadius: 16,
            overflow: 'hidden',
            background: '#090d16',
            border: '2px dashed var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {cameraError ? (
            <div style={{ textAlign: 'center', padding: 24, maxWidth: 320 }}>
              <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>⚠️</span>
              <p style={{ fontSize: 14, color: '#ef4444', fontWeight: 600, marginBottom: 12 }}>
                {cameraError}
              </p>
              <button className="btn btn-secondary btn-sm" onClick={startCamera}>
                Reintentar Conexión
              </button>
            </div>
          ) : capturedImage ? (
            <img
              src={capturedImage}
              alt="Snapshot"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
                }}
              />

              {/* Face Guide Oval */}
              <div
                style={{
                  position: 'absolute',
                  width: 200,
                  height: 260,
                  border: '2px dashed rgba(168, 85, 247, 0.7)',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                  boxShadow: '0 0 20px rgba(168, 85, 247, 0.2)',
                }}
              />

              {/* Countdown overlay */}
              {countdown !== null && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                  }}
                >
                  <span
                    style={{
                      fontSize: 80,
                      fontWeight: 900,
                      color: '#ffffff',
                      animation: 'pulse 0.8s infinite',
                      textShadow: '0 0 20px rgba(168,85,247,0.8)',
                    }}
                  >
                    {countdown}
                  </span>
                </div>
              )}
            </>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        {/* Action Controls */}
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {!capturedImage && !cameraError && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')}
              title="Cambiar Cámara"
            >
              🔄 Cambiar Cámara
            </button>
          )}

          <div style={{ display: 'flex', gap: 10, marginLeft: 'auto' }}>
            {capturedImage ? (
              <>
                <button className="btn btn-ghost" onClick={handleRetake}>
                  🔄 Tomar de nuevo
                </button>
                <button className="btn btn-primary" onClick={handleConfirm}>
                  ✨ Usar esta Foto
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-ghost" onClick={onClose}>
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleTakeSnapshot}
                  disabled={!!cameraError || countdown !== null}
                  style={{
                    background: 'linear-gradient(135deg, #ef4444, #ec4899)',
                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
                  }}
                >
                  📸 {countdown !== null ? `Sonríe... ${countdown}` : 'Tomar Foto'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
