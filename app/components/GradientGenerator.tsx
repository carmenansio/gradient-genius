"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Copy, Check, Plus, X, AlertCircle, ChevronUp, ChevronDown, Sparkles, Download, Share2 } from "lucide-react"
import { Inter, Poppins } from 'next/font/google'
import { toPng } from 'html-to-image'
import path from "path"

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
                <path d="M6.0023 20.405C6.00296 19.8195 6.11891 19.5126 6.47705 19.1484C6.92365 18.6943 7.55759 18.3905 8.48746 18.185C8.73813 18.1297 8.73814 18.1296 8.78127 17.9713L8.78128 17.9713C8.83984 17.7565 8.8729 17.6796 8.96629 17.5413C9.01011 17.4763 9.04198 17.4193 9.03712 17.4144C9.03225 17.4095 8.91566 17.3921 8.778 17.3757C7.49875 17.2232 6.4055 16.8194 5.5655 16.1891C5.32715 16.0103 5.00617 15.716 4.86425 15.5462L4.86425 15.5462C4.79187 15.4596 4.761 15.4227 4.74464 15.4282C4.73247 15.4324 4.72832 15.4601 4.72109 15.5083C4.69408 15.6884 4.56774 15.9237 4.43032 16.0499C4.199 16.2623 3.83787 16.3716 3.36712 16.3716C3.07756 16.3716 2.98118 16.3399 2.86354 16.2059C2.69488 16.0138 2.67528 15.7213 2.81749 15.519C2.92998 15.359 3.02609 15.3133 3.306 15.2871C3.43877 15.2746 3.55363 15.2582 3.56122 15.2506C3.5909 15.2209 3.32398 14.8913 3.07465 14.6497C2.93048 14.51 2.67023 14.2911 2.49631 14.1632C1.51034 13.4381 1.21303 13.1877 0.908215 12.8255C0.59631 12.4549 0.414081 12.1563 0.251688 11.7495C0.0532462 11.2523 -0.0470459 10.552 0.0215082 10.1423C0.18689 9.15414 0.795889 8.46085 1.68529 8.24831C1.98022 8.17783 2.49001 8.18984 2.80908 8.27479C3.26675 8.39664 3.72613 8.69815 4.02698 9.07416C4.3242 9.44566 4.62447 10.1126 4.73175 10.6396C4.76282 10.7923 4.76285 10.7923 4.86761 10.7057C5.21089 10.4219 5.3618 10.3207 5.66183 10.1729C5.99615 10.0082 5.99616 10.0082 6.23491 9.65256L6.23499 9.65243C6.55959 9.16893 6.7743 8.90669 7.16581 8.51558C7.54138 8.14038 7.96001 7.8157 8.32936 7.61318C8.46755 7.53741 8.58363 7.47359 8.58731 7.47132C8.59098 7.46904 8.53634 7.37126 8.46588 7.25404C8.00893 6.49373 8.11695 5.58401 8.7387 4.95661C8.86052 4.83368 9.02974 4.69643 9.13603 4.63439C10.0965 4.07371 11.3321 4.45591 11.8104 5.46166C11.9476 5.75006 11.9912 5.94953 11.9898 6.28156C11.9881 6.69545 11.8963 7.00204 11.678 7.32336C11.6247 7.40178 11.5844 7.46878 11.5884 7.47227C11.5924 7.47576 11.6612 7.51125 11.7412 7.55116C11.9361 7.64836 12.2877 7.87828 12.5185 8.05929C12.965 8.40962 13.6656 9.19165 13.9766 9.68673L13.9766 9.68675C14.0052 9.7324 14.0235 9.76145 14.0493 9.77995C14.0945 9.81232 14.1628 9.81233 14.3509 9.81236H14.3509C14.7297 9.81242 15.5377 9.7472 16.0126 9.67819C16.8081 9.56261 17.4487 9.41659 18.1152 9.19889C18.8089 8.97234 19.293 8.74784 19.7815 8.42613C19.9197 8.33512 20.0506 8.24977 20.0724 8.23647C20.0942 8.22316 20.2728 8.20634 20.4691 8.19907L20.8262 8.18584L20.5617 8.03657C20.1782 7.82014 19.3223 7.43889 18.5198 7.12698C17.8025 6.84825 17.3458 6.56096 16.8844 6.0983C16.5474 5.76024 16.3557 5.49837 16.1841 5.14167C15.7106 4.15744 15.7133 2.9605 16.1911 1.99693C16.7354 0.89914 17.7905 0.157899 18.9936 0.0278524C19.5126 -0.0282445 20.2809 0.00336123 20.6506 0.0960362C21.7828 0.379827 22.6525 1.31353 22.878 2.48739C22.896 2.58131 22.9113 2.81286 22.9118 3.00197C22.9133 3.5057 22.8228 3.89132 22.5936 4.35877C22.3552 4.84484 21.9583 5.15285 21.3565 5.3189L21.1345 5.38015L21.4035 5.52255C21.804 5.73453 22.084 5.9298 22.3494 6.18233C22.8589 6.66723 23.1834 7.22215 23.3509 7.89491C23.3988 8.08734 23.4151 8.15249 23.4563 8.17968C23.4774 8.1936 23.5051 8.19756 23.5469 8.20356C23.7112 8.22713 23.8236 8.2965 23.9203 8.43404C23.9912 8.53488 24 8.56866 24 8.73906C24 8.90688 23.9906 8.9443 23.9243 9.0401C23.8595 9.13365 23.7905 9.17805 23.4482 9.34669C22.4929 9.8172 21.7571 10.3979 19.6216 12.3666C17.9315 13.9248 17.2575 14.5058 16.3568 15.1815C14.7409 16.3936 13.4002 17.0256 11.847 17.3075C11.6506 17.3431 11.4106 17.3805 11.3135 17.3905C11.1372 17.4088 11.1372 17.4088 11.2239 17.5448C11.3053 17.6723 11.402 17.9117 11.4346 18.0662C11.4479 18.1293 11.4697 18.1386 11.7323 18.1937C12.3232 18.3177 12.9265 18.5573 13.3333 18.8293C13.5802 18.9945 13.8965 19.3254 14.0076 19.5348C14.1353 19.7755 14.1697 19.9404 14.1806 20.3653L14.1905 20.7488H10.0962H6.0019L6.0023 20.405ZM10.4476 7.02135C10.6268 6.92963 10.7338 6.82188 10.8206 6.6456C10.8942 6.49604 10.9065 6.44311 10.9051 6.28344C10.9021 5.9575 10.7434 5.69418 10.4665 5.55582C10.1725 5.4089 9.79965 5.45392 9.55942 5.66537C9.49245 5.7243 9.40562 5.83351 9.36645 5.90804C9.3044 6.02605 9.2952 6.07426 9.2952 6.28157C9.2952 6.48821 9.30451 6.53724 9.36566 6.65351C9.4468 6.80776 9.61464 6.96962 9.75387 7.02781C9.96508 7.11609 10.268 7.11329 10.4476 7.02135ZM21.9027 7.3395C22.0216 7.52524 22.1883 7.89473 22.1883 7.97241C22.1883 8.04226 22.1475 8.0188 22.1016 7.92252C22.0001 7.70977 21.6468 7.40408 21.1879 7.13206C20.7795 6.89003 19.8174 6.45625 18.8623 6.08357C17.7696 5.65728 17.1221 4.96142 16.9621 4.0416C16.8684 3.50308 16.9493 2.91226 17.1796 2.45216C17.5107 1.79074 18.0827 1.34083 18.8244 1.15841C19.1401 1.08076 20.0875 1.07428 20.3766 1.14781C20.6873 1.22681 20.9756 1.38484 21.2079 1.60335C21.4564 1.83708 21.6052 2.05766 21.7159 2.35621C21.7874 2.54915 21.8001 2.62283 21.8109 2.9094C21.8256 3.29742 21.7872 3.50391 21.6454 3.79857C21.5355 4.02716 21.3546 4.20153 21.1357 4.28982C21.0133 4.3392 20.9349 4.35065 20.7198 4.35073C20.4734 4.35081 20.4422 4.3447 20.2782 4.26395C20.0785 4.16559 19.9011 4.00584 19.8 3.83329C19.6891 3.64398 19.6492 3.43932 19.6492 3.05894V2.71707L19.2591 2.73061C18.9464 2.74148 18.8402 2.75539 18.7236 2.80072C18.1951 3.00612 17.9229 3.53871 18.046 4.12602C18.0695 4.23798 18.1411 4.43282 18.2105 4.57332C18.3161 4.78726 18.371 4.85989 18.6012 5.08999C19.0085 5.49718 19.406 5.74961 20.5073 6.30066C20.8567 6.47546 21.2124 6.66588 21.2977 6.72383C21.5191 6.87416 21.7652 7.12466 21.9027 7.3395ZM12.5129 9.73894C12.3495 9.53267 11.6639 8.89339 11.4229 8.72253C10.3229 7.94286 9.53977 8.02935 8.35279 9.0616C8.12954 9.25576 7.68637 9.7131 7.63165 9.8058C7.6161 9.83215 8.11735 9.83886 10.1021 9.83886C12.1821 9.83886 12.5245 9.83886 12.5347 9.78061C12.5368 9.76913 12.5259 9.75539 12.5129 9.73894ZM3.82084 12.5895C3.82703 13.3847 3.85094 13.6737 3.9264 13.8656C3.93639 13.8911 3.94033 13.9111 3.93515 13.9101C3.92997 13.9091 3.82454 13.8227 3.7009 13.7181C3.57725 13.6135 3.27376 13.3802 3.02646 13.1996C1.94221 12.4079 1.51045 11.9608 1.27945 11.3903C1.10687 10.9641 1.04789 10.3953 1.14596 10.1033C1.28058 9.70262 1.49008 9.43634 1.73856 9.35015C2.04055 9.24541 2.51141 9.27723 2.78031 9.42055C3.26061 9.67655 3.60217 10.3616 3.75705 11.3796C3.80508 11.6952 3.81542 11.8915 3.82084 12.5895ZM10.9501 16.3324C13.3791 16.0989 15.0709 15.1099 18.4883 11.9257C20.2494 10.2848 20.6252 9.95101 21.2703 9.4551L21.4765 9.29667L20.9581 9.28951L20.9579 9.2895C20.4397 9.28234 20.4396 9.28234 20.1569 9.45986C19.1561 10.0881 17.7522 10.5474 16.1713 10.7638L16.129 10.7696C15.9343 10.7963 15.7777 10.8177 15.6207 10.8351C14.977 10.9062 14.3256 10.9087 11.0031 10.9213L10.8287 10.922L10.8234 10.922H10.8233C6.75568 10.9374 6.75559 10.9374 6.5441 10.997C5.56746 11.2724 4.91842 12.0981 4.91771 13.0661C4.91731 13.6079 5.18285 14.1904 5.72245 14.8313C5.94689 15.0979 6.13856 15.2689 6.43627 15.4682C7.1554 15.9496 8.09003 16.245 9.20215 16.3423C9.62403 16.3792 10.5154 16.3742 10.9501 16.3324Z" fill="currentColor"/>
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