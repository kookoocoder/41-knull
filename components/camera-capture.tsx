"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Camera, RefreshCw, SwitchCamera } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { ImageData } from "@/app/page"

interface CameraCaptureProps {
  onCapture: (imageData: ImageData) => void
}

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const [isCameraAvailable, setIsCameraAvailable] = useState<boolean>(false)
  const [isCapturing, setIsCapturing] = useState<boolean>(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Check if camera is available and detect multiple cameras
    const checkCameraAvailability = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        setIsCameraAvailable(true)

        try {
          const devices = await navigator.mediaDevices.enumerateDevices()
          const videoDevices = devices.filter((device) => device.kind === "videoinput")
          setHasMultipleCameras(videoDevices.length > 1)
        } catch (error) {
          console.error("Error enumerating devices:", error)
        }
      } else {
        setCameraError("Camera not available on this device or browser")
      }
    }

    checkCameraAvailability()

    return () => {
      // Clean up camera stream when component unmounts
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      setIsCapturing(true)
      setCameraError(null)

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
        },
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      setCameraError("Could not access camera. Please check permissions.")
      setIsCapturing(false)

      toast({
        variant: "destructive",
        title: "Camera Error",
        description: "Could not access camera. Please check permissions and try again.",
      })
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const tracks = stream.getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setIsCapturing(false)
  }

  const switchCamera = async () => {
    stopCamera()
    setFacingMode(facingMode === "user" ? "environment" : "user")
    setTimeout(() => {
      startCamera()
    }, 100)
  }

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert canvas to data URL with high quality
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9)

    // Create a file from the data URL
    const byteString = atob(dataUrl.split(",")[1])
    const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0]
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i)
    }

    const blob = new Blob([ab], { type: mimeString })
    const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: "image/jpeg" })

    // Pass the captured image data to parent component
    onCapture({
      file,
      dataUrl,
      source: "camera",
    })

    // Stop the camera after capturing
    stopCamera()

    toast({
      title: "Photo captured",
      description: "Your photo has been captured successfully.",
    })
  }

  const handleRetry = () => {
    stopCamera()
    startCamera()
  }

  return (
    <div className="space-y-4">
      {!isCameraAvailable ? (
        <div className="text-center p-6 md:p-8 border-2 border-dashed border-border rounded-xl">
          <p className="text-muted-foreground text-sm md:text-base">
            {cameraError || "Camera functionality is not available on this device."}
          </p>
        </div>
      ) : (
        <>
          <div className="relative aspect-[4/3] md:aspect-video w-full overflow-hidden rounded-xl border border-border/50 bg-black flex items-center justify-center">
            {!isCapturing ? (
              <Button
                onClick={startCamera}
                className="absolute inset-0 m-auto w-auto h-auto flex flex-col gap-3 bg-background/20 backdrop-blur-sm hover:bg-background/30"
                size="lg"
              >
                <Camera className="h-6 w-6 md:h-8 md:w-8" />
                <span className="text-sm md:text-base">Start Camera</span>
              </Button>
            ) : (
              <>
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                {cameraError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                    <p className="text-destructive text-sm md:text-base px-4 text-center">{cameraError}</p>
                  </div>
                )}
              </>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {isCapturing && (
            <div className="flex gap-2">
              <Button onClick={captureImage} className="flex-1" variant="default">
                <Camera className="mr-2 h-4 w-4" />
                Capture
              </Button>
              {hasMultipleCameras && (
                <Button onClick={switchCamera} variant="outline" size="icon">
                  <SwitchCamera className="h-4 w-4" />
                </Button>
              )}
              <Button onClick={handleRetry} variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
