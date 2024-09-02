"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Copy, Check, Plus, X, AlertCircle, ChevronUp, ChevronDown, Sparkles, Download, Share2 } from "lucide-react"
import { Inter, Poppins } from 'next/font/google'
import { toPng } from 'html-to-image'

const inter = Inter({ subsets: ['latin'] })
const poppins = Poppins({ weight: ['400', '600', '700'], subsets: ['latin'] })

function CodeSnippet({ code }: { code: string }) {
  const [isCopied, setIsCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <div className="relative mt-4 bg-gray-950 rounded-lg overflow-hidden border border-gray-800">
      <pre className="p-4 overflow-x-auto text-sm text-gray-300 font-mono">
        <code>
          <span className="text-purple-400">background</span>
          <span className="text-gray-300">: </span>
          <span className="text-green-400">{code}</span>
        </code>
      </pre>
      <button
        onClick={copyToClipboard}
        className="absolute top-2 right-2 p-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
        aria-label={isCopied ? "Copied to clipboard" : "Copy to clipboard"}
      >
        {isCopied ? (
          <Check className="w-4 h-4" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  )
}

export default function GradientGenius() {
  const [angle, setAngle] = useState(90)
  const [colors, setColors] = useState([
    { id: 1, color: "#3B82F6", position: 0 },
    { id: 2, color: "#8B5CF6", position: 100 },
  ])
  const [gradientType, setGradientType] = useState("linear")
  const [error, setError] = useState("")
  const [isExpanded, setIsExpanded] = useState(true)
  const [shareMessage, setShareMessage] = useState("")
  const gradientRef = useRef<HTMLDivElement>(null)

  const addColor = () => {
    if (colors.length < 5) {
      const newId = Math.max(...colors.map(c => c.id)) + 1
      const newPosition = 50 + (colors.length - 2) * 16.67 // Adjust position for each new color
      setColors([...colors, { id: newId, color: "#FFFFFF", position: newPosition }])
      setError("")
    } else {
      setError("Maximum of 5 colors reached")
      setTimeout(() => setError(""), 3000)
    }
  }

  const removeColor = (id: number) => {
    if (colors.length > 2) {
      setColors(colors.filter(c => c.id !== id))
      setError("")
    } else {
      setError("Minimum of 2 colors required")
      setTimeout(() => setError(""), 3000)
    }
  }

  const updateColor = useCallback((id: number, color: string) => {
    setColors(colors => colors.map(c => c.id === id ? { ...c, color } : c))
  }, [])

  const updatePosition = useCallback((id: number, position: number) => {
    setColors(colors => colors.map(c => c.id === id ? { ...c, position } : c))
  }, [])

  const gradientCSS = gradientType === "linear"
    ? `linear-gradient(${angle}deg, ${colors
        .sort((a, b) => a.position - b.position)
        .map(c => `${c.color} ${c.position}%`)
        .join(", ")});`
    : `radial-gradient(circle, ${colors
        .sort((a, b) => a.position - b.position)
        .map(c => `${c.color} ${c.position}%`)
        .join(", ")});`

  const gradientStyle = {
    backgroundImage: gradientType === "linear"
      ? `linear-gradient(${angle}deg, ${colors
          .sort((a, b) => a.position - b.position)
          .map(c => `${c.color} ${c.position}%`)
          .join(", ")})`
      : `radial-gradient(circle, ${colors
          .sort((a, b) => a.position - b.position)
          .map(c => `${c.color} ${c.position}%`)
          .join(", ")})`,
  }

  const [randomTip, setRandomTip] = useState("")
  const tips = [
    "Try using complementary colors for a vibrant look!",
    "Soft gradients work well for backgrounds.",
    "Experiment with different angles for unique effects.",
    "Use radial gradients for a focal point.",
    "Combine multiple gradients for complex designs.",
  ]

  useEffect(() => {
    setRandomTip(tips[Math.floor(Math.random() * tips.length)])
  }, [])

  const downloadGradient = useCallback(() => {
    if (gradientRef.current === null) {
      return
    }

    toPng(gradientRef.current, { cacheBust: true, })
      .then((dataUrl) => {
        const link = document.createElement('a')
        link.download = 'gradient.png'
        link.href = dataUrl
        link.click()
      })
      .catch((err) => {
        console.error('Error downloading gradient:', err)
      })
  }, [gradientRef])

  const shareGradient = useCallback(() => {
    const gradientData = {
      type: gradientType,
      angle,
      colors: colors.map(c => ({ color: c.color, position: c.position })),
    }
    const shareableLink = `${window.location.origin}?gradient=${encodeURIComponent(JSON.stringify(gradientData))}`
    
    navigator.clipboard.writeText(shareableLink)
      .then(() => {
        setShareMessage("Shareable link copied to clipboard!")
        setTimeout(() => setShareMessage(""), 3000)
      })
      .catch(err => {
        console.error('Error copying to clipboard:', err)
        setShareMessage("Failed to copy link. Please try again.")
        setTimeout(() => setShareMessage(""), 3000)
      })
  }, [gradientType, angle, colors])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const gradientParam = urlParams.get('gradient')
    if (gradientParam) {
      try {
        const gradientData = JSON.parse(decodeURIComponent(gradientParam))
        setGradientType(gradientData.type)
        setAngle(gradientData.angle)
        setColors(gradientData.colors.map((c: any, index: number) => ({ id: index + 1, ...c })))
      } catch (error) {
        console.error('Error parsing gradient data:', error)
      }
    }
  }, [])

  return (
    <div className={`min-h-screen bg-gray-950 text-gray-100 flex flex-col ${inter.className}`}>
      <main className="flex-grow flex items-center justify-center w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-7xl">
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <h1 className={`text-6xl font-bold mb-4 ${poppins.className} text-white flex items-center justify-center`}>
              <svg className="w-12 h-12 mr-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.5 12.5C19.5 11.12 20.62 10 22 10V9C22 6.24 19.76 4 17 4H7C4.24 4 2 6.24 2 9V10C3.38 10 4.5 11.12 4.5 12.5C4.5 13.88 3.38 15 2 15V16C2 18.76 4.24 21 7 21H17C19.76 21 22 18.76 22 16V15C20.62 15 19.5 13.88 19.5 12.5ZM17 19H7C5.34 19 4 17.66 4 16C5.66 16 7 14.66 7 13C7 11.34 5.66 10 4 10V9C4 7.34 5.34 6 7 6H17C18.66 6 20 7.34 20 9C18.34 9 17 10.34 17 12C17 13.66 18.34 15 20 15V16C20 17.66 18.66 19 17 19Z" fill="currentColor"/>
                <path d="M14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12Z" fill="currentColor"/>
              </svg>
              Gradient Genius
            </h1>
            <p className="text-xl text-gray-400 mb-4">
              Craft stunning gradients with ease and precision
            </p>
            <div className="text-sm text-gray-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 mr-2" />
              <span>{randomTip}</span>
            </div>
          </motion.header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gray-900 rounded-xl p-6 border border-gray-800"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-2xl font-semibold ${poppins.className}`}>
                    Gradient Controls
                  </h2>
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-gray-400 hover:text-white focus:outline-none"
                    aria-label={isExpanded ? "Collapse controls" : "Expand controls"}
                  >
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="mb-6">
                        <label className="block text-sm font-medium mb-2 text-gray-300">
                          Gradient Type
                        </label>
                        <div className="flex space-x-4">
                          <button
                            onClick={() => setGradientType("linear")}
                            className={`px-4 py-2 rounded-md ${
                              gradientType === "linear"
                                ? "bg-purple-600 text-white"
                                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                            }`}
                          >
                            Linear
                          </button>
                          <button
                            onClick={() => setGradientType("radial")}
                            className={`px-4 py-2 rounded-md ${
                              gradientType === "radial"
                                ? "bg-purple-600 text-white"
                                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                            }`}
                          >
                            Radial
                          </button>
                        </div>
                      </div>

                      {gradientType === "linear" && (
                        <div className="mb-6">
                          <label htmlFor="angle" className="block text-sm font-medium mb-1 text-gray-300">
                            Angle: {angle}°
                          </label>
                          <input
                            type="range"
                            id="angle"
                            min="0"
                            max="360"
                            value={angle}
                            onChange={(e) => setAngle(Number(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, #4B5563 0%, #4B5563 ${angle / 3.6}%, #6B7280 ${angle / 3.6}%, #6B7280 100%)`,
                            }}
                          />
                        </div>
                      )}

                      <div>
                        <h3 className={`text-lg font-semibold mb-4 ${poppins.className} text-gray-300`}>
                          Color Stops
                        </h3>
                        <AnimatePresence>
                          {colors.map((color, index) => (
                            <motion.div
                              key={color.id}
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="flex items-center space-x-4 mb-4"
                            >
                              <div className="flex items-center space-x-2">
                                <input
                                  type="color"
                                  value={color.color}
                                  onChange={(e) => updateColor(color.id, e.target.value)}
                                  className="w-8 h-8 rounded-full border border-gray-600 bg-transparent cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={color.color}
                                  onChange={(e) => updateColor(color.id, e.target.value)}
                                  className="w-20 px-2 py-1 text-sm bg-gray-800 border border-gray-700 rounded-md text-gray-300"
                                />
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={color.position}
                                onChange={(e) => updatePosition(color.id, Number(e.target.value))}
                                className="flex-grow h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                style={{
                                  background: `linear-gradient(to right, #4B5563 0%, #4B5563 ${color.position}%, #6B7280 ${color.position}%, #6B7280 100%)`,
                                }}
                              />
                              {index > 1 && (
                                <button
                                  onClick={() => removeColor(color.id)}
                                  className="p-1 bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                  aria-label="Remove color"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        {colors.length < 5 && (
                          <button
                            onClick={addColor}
                            className="mt-4 p-2 bg-gray-800 text-gray-300 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            aria-label="Add color"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center space-x-2 text-red-400 bg-red-900/50 p-3 rounded-md"
                  >
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="lg:col-span-2 space-y-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-gray-900 rounded-xl p-6 border border-gray-800"
              >
                <h2 className={`text-2xl font-semibold mb-4 ${poppins.className} text-gray-300`}>Gradient Preview</h2>
                <div
                  ref={gradientRef}
                  className="h-64 rounded-lg shadow-lg"
                  style={gradientStyle}
                ></div>
                <div className="mt-4 flex justify-end space-x-4">
                  <button 
                    onClick={downloadGradient}
                    className="px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </button>
                  <button 
                    onClick={shareGradient}
                    className="px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </button>
                </div>
                {shareMessage && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2 text-sm text-green-400"
                  >
                    {shareMessage}
                  </motion.p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-gray-900 rounded-xl p-6 border border-gray-800"
              >
                <h2 className={`text-2xl font-semibold mb-4 ${poppins.className} text-gray-300`}>Generated CSS</h2>
                <CodeSnippet code={gradientCSS} />
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <footer className="w-full py-4 px-4 sm:px-6 lg:px-8 bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Gradient Genius
          </p>
          <p className="text-sm text-gray-400">
            Crafted with 💖
          </p>
        </div>
      </footer>
    </div>
  )
}