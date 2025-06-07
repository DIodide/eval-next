"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react"

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("Form submitted:", formData)
    alert("Thank you for your message! We'll get back to you within 24 hours.")

    // Reset form
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      category: "",
      subject: "",
      message: "",
    })

    setIsSubmitting(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-black">

      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-orbitron text-4xl md:text-6xl font-black text-white mb-4 cyber-text glow-text">
            CONTACT US
          </h1>
          <p className="text-xl text-gray-300 mb-8 font-rajdhani max-w-3xl mx-auto">
            Have questions about EVAL? We&apos;re here to help you on your esports journey.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
          {/* Contact Form - Takes up 2/3 of the space */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800 border-gray-700 hover:border-cyan-400/30 transition-colors">
              <CardHeader className="pb-6">
                <CardTitle className="font-orbitron text-2xl text-white tracking-wide flex items-center">
                  <MessageSquare className="w-6 h-6 text-cyan-400 mr-3" />
                  Send us a Message
                </CardTitle>
                <p className="text-gray-400 font-rajdhani">
                  Fill out the form below and we&apos;ll get back to you as soon as possible.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-white font-orbitron text-sm tracking-wide">
                        First Name *
                      </Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white font-rajdhani focus:border-cyan-400 focus:ring-cyan-400"
                        placeholder="Enter your first name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-white font-orbitron text-sm tracking-wide">
                        Last Name *
                      </Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white font-rajdhani focus:border-cyan-400 focus:ring-cyan-400"
                        placeholder="Enter your last name"
                        required
                      />
                    </div>
                  </div>

                  {/* Email and Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white font-orbitron text-sm tracking-wide">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white font-rajdhani focus:border-cyan-400 focus:ring-cyan-400"
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-white font-orbitron text-sm tracking-wide">
                        Category *
                      </Label>
                      <Select onValueChange={(value: string) => handleInputChange("category", value)} required>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white font-rajdhani focus:border-cyan-400 focus:ring-cyan-400">
                          <SelectValue placeholder="Select your category" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          <SelectItem value="player" className="text-white font-rajdhani focus:bg-gray-600">
                            Player
                          </SelectItem>
                          <SelectItem value="coach" className="text-white font-rajdhani focus:bg-gray-600">
                            Coach
                          </SelectItem>
                          <SelectItem value="league" className="text-white font-rajdhani focus:bg-gray-600">
                            League
                          </SelectItem>
                          <SelectItem value="organization" className="text-white font-rajdhani focus:bg-gray-600">
                            Organization
                          </SelectItem>
                          <SelectItem value="parent" className="text-white font-rajdhani focus:bg-gray-600">
                            Parent/Guardian
                          </SelectItem>
                          <SelectItem value="media" className="text-white font-rajdhani focus:bg-gray-600">
                            Media/Press
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-white font-orbitron text-sm tracking-wide">
                      Subject of Inquiry *
                    </Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white font-rajdhani focus:border-cyan-400 focus:ring-cyan-400"
                      placeholder="Brief description of your inquiry"
                      required
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-white font-orbitron text-sm tracking-wide">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement> ) => handleInputChange("message", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white font-rajdhani min-h-[150px] focus:border-cyan-400 focus:ring-cyan-400"
                      placeholder="Please provide details about your inquiry. The more information you provide, the better we can assist you."
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600 text-black font-orbitron font-bold py-3 tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      "SENDING..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        SEND MESSAGE
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information Sidebar - Takes up 1/3 of the space */}
          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <h3 className="font-orbitron text-xl text-white mb-6 tracking-wide">Get in Touch</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-white font-orbitron text-sm">Email</p>
                      <p className="text-gray-300 font-rajdhani">contact@evalgaming.com</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-white font-orbitron text-sm">Phone</p>
                      <p className="text-gray-300 font-rajdhani">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-white font-orbitron text-sm">Location</p>
                      <p className="text-gray-300 font-rajdhani">
                        Princeton University
                        <br />
                        Princeton, NJ 08544
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-400/30">
              <CardContent className="p-6">
                <h3 className="font-orbitron text-white text-lg mb-3">Response Time</h3>
                <p className="text-gray-300 font-rajdhani text-sm leading-relaxed">
                  We typically respond to all inquiries within{" "}
                  <span className="text-cyan-400 font-semibold">24 hours</span>. For urgent matters, please call us
                  directly.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <h3 className="font-orbitron text-white text-lg mb-3">Office Hours</h3>
                <div className="space-y-2 text-sm font-rajdhani">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Monday - Friday</span>
                    <span className="text-white">9:00 AM - 6:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Saturday</span>
                    <span className="text-white">10:00 AM - 4:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Sunday</span>
                    <span className="text-white">Closed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

    </div>
  )
}
