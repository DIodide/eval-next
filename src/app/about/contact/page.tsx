"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle, AlertCircle } from "lucide-react"
import { env } from "@/env"

export default function AboutContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    category: "",
    subject: "",
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  })

  const sendToDiscord = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    category: string;
    subject: string;
    message: string;
  }) => { 
    const webhookUrl = env.NEXT_PUBLIC_DISCORD_WEBHOOK_CONTACT!
    if (!webhookUrl) {
      console.warn("Discord webhook URL not configured")
      return false
    }

    try {
      const embed = {
        title: "New Contact Form Submission",
        color: 0x00FFFF, // Cyan color to match the theme
        fields: [
          {
            name: "👤 Name",
            value: `${data.firstName} ${data.lastName}`,
            inline: true
          },
          {
            name: "📧 Email",
            value: data.email,
            inline: true
          },
          {
            name: "🏷️ Category",
            value: data.category,
            inline: true
          },
          {
            name: "📝 Subject",
            value: data.subject,
            inline: false
          },
          {
            name: "💬 Message",
            value: data.message.length > 1000 
              ? data.message.substring(0, 1000) + "..."
              : data.message,
            inline: false
          }
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: "EVAL Contact Form"
        }
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          embeds: [embed]
        }),
      })

      return response.ok
    } catch (error) {
      console.error("Failed to send to Discord:", error)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Send to Discord
      const discordSuccess = await sendToDiscord(formData)
      
      if (discordSuccess) {
        setModalState({
          isOpen: true,
          type: 'success',
          title: 'Message Sent Successfully!',
          message: "Thank you for your message! We'll get back to you within 24 hours."
        })
        console.log("Form submitted successfully:", formData)
        
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          category: "",
          subject: "",
          message: "",
        })
      } else {
        setModalState({
          isOpen: true,
          type: 'error',
          title: 'Message Failed to Send',
          message: 'There was an issue sending your message. Please try again or contact us directly at support@evalgaming.com.'
        })
      }
    } catch (error) {
      console.error("Form submission error:", error)
      setModalState({
        isOpen: true,
        type: 'error', 
        title: 'Message Failed to Send',
        message: 'There was an issue sending your message. Please try again or contact us directly at support@evalgaming.com.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Hero Section with Contact Form */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-orange-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.1)_0%,transparent_50%)]" />
        
        <div className="container mx-auto px-6 relative z-10">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-full px-6 py-3 mb-6 border border-cyan-400/30">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              <span className="font-orbitron text-cyan-400 text-sm tracking-wider">CONTACT US</span>
            </div>
            
            <h1 className="font-orbitron text-3xl md:text-5xl font-black text-white mb-4 cyber-text">
              GET IN <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">TOUCH</span>
            </h1>
            
            <p className="text-gray-300 font-rajdhani leading-relaxed">
              Have questions about EVAL? Need support? We&apos;re here to help.
            </p>
          </div>

          {/* Large Contact Form */}
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-cyan-400/30 transition-all duration-300 backdrop-blur-sm">
              <CardHeader className="pb-8">
                <CardTitle className="font-orbitron text-3xl text-white tracking-wide text-center">
                  Send us a Message
                </CardTitle>
                <p className="text-gray-400 font-rajdhani text-center text-lg">
                  Fill out the form below and we&apos;ll get back to you as soon as possible.
                </p>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="firstName" className="text-white font-orbitron text-sm tracking-wide">
                        First Name *
                      </Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className="bg-gray-700/50 border-gray-600 text-white font-rajdhani focus:border-cyan-400 focus:ring-cyan-400 h-12 text-lg"
                        placeholder="Enter your first name"
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="lastName" className="text-white font-orbitron text-sm tracking-wide">
                        Last Name *
                      </Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        className="bg-gray-700/50 border-gray-600 text-white font-rajdhani focus:border-cyan-400 focus:ring-cyan-400 h-12 text-lg"
                        placeholder="Enter your last name"
                        required
                      />
                    </div>
                  </div>

                  {/* Email and Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-white font-orbitron text-sm tracking-wide">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="bg-gray-700/50 border-gray-600 text-white font-rajdhani focus:border-cyan-400 focus:ring-cyan-400 h-12 text-lg"
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="category" className="text-white font-orbitron text-sm tracking-wide">
                        Category *
                      </Label>
                      <Select onValueChange={(value: string) => handleInputChange("category", value)} required>
                        <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white font-rajdhani focus:border-cyan-400 focus:ring-cyan-400 h-12 text-lg">
                          <SelectValue placeholder="Select your category" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="player" className="text-white font-rajdhani focus:bg-gray-700">
                            Player
                          </SelectItem>
                          <SelectItem value="coach" className="text-white font-rajdhani focus:bg-gray-700">
                            Coach
                          </SelectItem>
                          <SelectItem value="league" className="text-white font-rajdhani focus:bg-gray-700">
                            League
                          </SelectItem>
                          <SelectItem value="organization" className="text-white font-rajdhani focus:bg-gray-700">
                            Organization
                          </SelectItem>
                          <SelectItem value="parent" className="text-white font-rajdhani focus:bg-gray-700">
                            Parent/Guardian
                          </SelectItem>
                          <SelectItem value="media" className="text-white font-rajdhani focus:bg-gray-700">
                            Media/Press
                          </SelectItem>
                          <SelectItem value="partnership" className="text-white font-rajdhani focus:bg-gray-700">
                            Partnership Inquiry
                          </SelectItem>
                          <SelectItem value="technical" className="text-white font-rajdhani focus:bg-gray-700">
                            Technical Support
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-3">
                    <Label htmlFor="subject" className="text-white font-orbitron text-sm tracking-wide">
                      Subject of Inquiry *
                    </Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      className="bg-gray-700/50 border-gray-600 text-white font-rajdhani focus:border-cyan-400 focus:ring-cyan-400 h-12 text-lg"
                      placeholder="Brief description of your inquiry"
                      required
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-3">
                    <Label htmlFor="message" className="text-white font-orbitron text-sm tracking-wide">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement> ) => handleInputChange("message", e.target.value)}
                      className="bg-gray-700/50 border-gray-600 text-white font-rajdhani min-h-[160px] focus:border-cyan-400 focus:ring-cyan-400 resize-none text-lg"
                      placeholder="Please provide details about your inquiry. The more information you provide, the better we can assist you."
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-cyan-400 to-purple-400 hover:from-cyan-500 hover:to-purple-500 text-black font-orbitron font-bold py-4 text-xl tracking-wider disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-cyan-400/30 transition-all duration-300"
                  >
                    {isSubmitting ? (
                      "SENDING..."
                    ) : (
                      <>
                        <Send className="w-6 h-6 mr-3" />
                        SEND MESSAGE
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer Contact Info */}
      <section className="py-12 bg-gradient-to-b from-gray-900/50 to-transparent">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="font-orbitron text-xl text-white mb-4">Other Ways to Reach Us</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="text-gray-300">
                <Mail className="w-6 h-6 mx-auto mb-2 text-cyan-400" />
                <p className="font-orbitron text-sm text-white mb-1">Email</p>
                <a href="mailto:support@evalgaming.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                  support@evalgaming.com
                </a>
              </div>
              <div className="text-gray-300">
                <Phone className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                <p className="font-orbitron text-sm text-white mb-1">Phone</p>
                <a href="tel:+12156781829" className="text-purple-400 hover:text-purple-300 transition-colors">
                  +1 (215) 678-1829
                </a>
              </div>
              <div className="text-gray-300">
                <MapPin className="w-6 h-6 mx-auto mb-2 text-orange-400" />
                <p className="font-orbitron text-sm text-white mb-1">Location</p>
                <span className="text-orange-400">Princeton, NJ 08544</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success/Error Modal */}
      <Dialog open={modalState.isOpen} onOpenChange={(open) => setModalState(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 font-orbitron text-xl">
              {modalState.type === 'success' ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-400" />
              )}
              {modalState.title}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-gray-300 font-rajdhani leading-relaxed">
            {modalState.message}
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  )
}
