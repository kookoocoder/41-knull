export async function extractColors(imageUrl: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject(new Error("Could not get canvas context"))
          return
        }

        // Scale down large images for performance
        const maxDimension = 300
        let width = img.width
        let height = img.height

        if (width > maxDimension || height > maxDimension) {
          const ratio = width / height
          if (width > height) {
            width = maxDimension
            height = Math.floor(width / ratio)
          } else {
            height = maxDimension
            width = Math.floor(height * ratio)
          }
        }

        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Sample colors from different regions
        const colors: { [key: string]: number } = {}
        const step = Math.max(4, Math.floor(data.length / 4 / 1000)) * 4 // Sample at most 1000 pixels

        for (let i = 0; i < data.length; i += step) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const alpha = data[i + 3]

          if (alpha > 128) {
            // Only consider non-transparent pixels
            const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
            colors[hex] = (colors[hex] || 0) + 1
          }
        }

        // Get the most frequent colors
        const sortedColors = Object.entries(colors)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([color]) => color)

        // Ensure we have at least 3 colors
        const defaultColors = ["#6366f1", "#8b5cf6", "#06b6d4"]
        const finalColors = [...sortedColors, ...defaultColors].slice(0, 3)

        resolve(finalColors)
      } catch (error) {
        // If color extraction fails, return default colors
        console.warn("Color extraction failed, using defaults:", error)
        resolve(["#6366f1", "#8b5cf6", "#06b6d4"])
      }
    }

    img.onerror = () => {
      // If image loading fails, return default colors
      console.warn("Image loading failed for color extraction, using defaults")
      resolve(["#6366f1", "#8b5cf6", "#06b6d4"])
    }

    img.src = imageUrl
  })
}
