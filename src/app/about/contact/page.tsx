"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { env } from "@/env";

export default function AboutContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    category: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  const sendToDiscord = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    category: string;
    subject: string;
    message: string;
  }) => {
    const webhookUrl = env.NEXT_PUBLIC_DISCORD_WEBHOOK_CONTACT!;
    if (!webhookUrl) {
      console.warn("Discord webhook URL not configured");
      return false;
    }

    try {
      const embed = {
        title: "New Contact Form Submission",
        color: 0x00ffff, // Cyan color to match the theme
        fields: [
          {
            name: "👤 Name",
            value: `${data.firstName} ${data.lastName}`,
            inline: true,
          },
          {
            name: "📧 Email",
            value: data.email,
            inline: true,
          },
          {
            name: "🏷️ Category",
            value: data.category,
            inline: true,
          },
          {
            name: "📝 Subject",
            value: data.subject,
            inline: false,
          },
          {
            name: "💬 Message",
            value:
              data.message.length > 1000
                ? data.message.substring(0, 1000) + "..."
                : data.message,
            inline: false,
          },
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: "EVAL Contact Form",
        },
      };

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          embeds: [embed],
        }),
      });

      return response.ok;
    } catch (error) {
      console.error("Failed to send to Discord:", error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send to Discord
      const discordSuccess = await sendToDiscord(formData);

      if (discordSuccess) {
        setModalState({
          isOpen: true,
          type: "success",
          title: "Message Sent Successfully!",
          message:
            "Thank you for your message! We'll get back to you within 24 hours.",
        });
        console.log("Form submitted successfully:", formData);

        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          category: "",
          subject: "",
          message: "",
        });
      } else {
        setModalState({
          isOpen: true,
          type: "error",
          title: "Message Failed to Send",
          message:
            "There was an issue sending your message. Please try again or contact us directly at support@evalgaming.com.",
        });
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setModalState({
        isOpen: true,
        type: "error",
        title: "Message Failed to Send",
        message:
          "There was an issue sending your message. Please try again or contact us directly at support@evalgaming.com.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Hero Section with Contact Form */}
      <section className="relative overflow-hidden py-12">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-orange-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.1)_0%,transparent_50%)]" />

        <div className="relative z-10 container mx-auto px-6">
          {/* Header */}
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-cyan-400/30 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 px-6 py-3">
              <MessageSquare className="h-5 w-5 text-cyan-400" />
              <span className="font-orbitron text-sm tracking-wider text-cyan-400">
                CONTACT US
              </span>
            </div>

            <h1 className="font-orbitron cyber-text mb-4 text-3xl font-black text-white md:text-5xl">
              GET IN{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                TOUCH
              </span>
            </h1>

            <p className="font-rajdhani leading-relaxed text-gray-300">
              Have questions about EVAL? Need support? We&apos;re here to help.
            </p>
          </div>

          {/* Large Contact Form */}
          <div className="mx-auto max-w-4xl">
            <Card className="border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-sm transition-all duration-300 hover:border-cyan-400/30">
              <CardHeader className="pb-8">
                <CardTitle className="font-orbitron text-center text-3xl tracking-wide text-white">
                  Send us a Message
                </CardTitle>
                <p className="font-rajdhani text-center text-lg text-gray-400">
                  Fill out the form below and we&apos;ll get back to you as soon
                  as possible.
                </p>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <Label
                        htmlFor="firstName"
                        className="font-orbitron text-sm tracking-wide text-white"
                      >
                        First Name *
                      </Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        className="font-rajdhani h-12 border-gray-600 bg-gray-700/50 text-lg text-white focus:border-cyan-400 focus:ring-cyan-400"
                        placeholder="Enter your first name"
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <Label
                        htmlFor="lastName"
                        className="font-orbitron text-sm tracking-wide text-white"
                      >
                        Last Name *
                      </Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        className="font-rajdhani h-12 border-gray-600 bg-gray-700/50 text-lg text-white focus:border-cyan-400 focus:ring-cyan-400"
                        placeholder="Enter your last name"
                        required
                      />
                    </div>
                  </div>

                  {/* Email and Category */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <Label
                        htmlFor="email"
                        className="font-orbitron text-sm tracking-wide text-white"
                      >
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="font-rajdhani h-12 border-gray-600 bg-gray-700/50 text-lg text-white focus:border-cyan-400 focus:ring-cyan-400"
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <Label
                        htmlFor="category"
                        className="font-orbitron text-sm tracking-wide text-white"
                      >
                        Category *
                      </Label>
                      <Select
                        onValueChange={(value: string) =>
                          handleInputChange("category", value)
                        }
                        required
                      >
                        <SelectTrigger className="font-rajdhani h-12 border-gray-600 bg-gray-700/50 text-lg text-white focus:border-cyan-400 focus:ring-cyan-400">
                          <SelectValue placeholder="Select your category" />
                        </SelectTrigger>
                        <SelectContent className="border-gray-600 bg-gray-800">
                          <SelectItem
                            value="player"
                            className="font-rajdhani text-white focus:bg-gray-700"
                          >
                            Player
                          </SelectItem>
                          <SelectItem
                            value="coach"
                            className="font-rajdhani text-white focus:bg-gray-700"
                          >
                            Coach
                          </SelectItem>
                          <SelectItem
                            value="league"
                            className="font-rajdhani text-white focus:bg-gray-700"
                          >
                            League
                          </SelectItem>
                          <SelectItem
                            value="organization"
                            className="font-rajdhani text-white focus:bg-gray-700"
                          >
                            Organization
                          </SelectItem>
                          <SelectItem
                            value="parent"
                            className="font-rajdhani text-white focus:bg-gray-700"
                          >
                            Parent/Guardian
                          </SelectItem>
                          <SelectItem
                            value="media"
                            className="font-rajdhani text-white focus:bg-gray-700"
                          >
                            Media/Press
                          </SelectItem>
                          <SelectItem
                            value="partnership"
                            className="font-rajdhani text-white focus:bg-gray-700"
                          >
                            Partnership Inquiry
                          </SelectItem>
                          <SelectItem
                            value="technical"
                            className="font-rajdhani text-white focus:bg-gray-700"
                          >
                            Technical Support
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="subject"
                      className="font-orbitron text-sm tracking-wide text-white"
                    >
                      Subject of Inquiry *
                    </Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) =>
                        handleInputChange("subject", e.target.value)
                      }
                      className="font-rajdhani h-12 border-gray-600 bg-gray-700/50 text-lg text-white focus:border-cyan-400 focus:ring-cyan-400"
                      placeholder="Brief description of your inquiry"
                      required
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="message"
                      className="font-orbitron text-sm tracking-wide text-white"
                    >
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        handleInputChange("message", e.target.value)
                      }
                      className="font-rajdhani min-h-[160px] resize-none border-gray-600 bg-gray-700/50 text-lg text-white focus:border-cyan-400 focus:ring-cyan-400"
                      placeholder="Please provide details about your inquiry. The more information you provide, the better we can assist you."
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="font-orbitron w-full bg-gradient-to-r from-cyan-400 to-purple-400 py-4 text-xl font-bold tracking-wider text-black shadow-lg transition-all duration-300 hover:from-cyan-500 hover:to-purple-500 hover:shadow-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      "SENDING..."
                    ) : (
                      <>
                        <Send className="mr-3 h-6 w-6" />
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
      <section className="bg-gradient-to-b from-gray-900/50 to-transparent py-12">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 text-center">
              <h3 className="font-orbitron mb-4 text-xl text-white">
                Other Ways to Reach Us
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-6 text-center md:grid-cols-3">
              <div className="text-gray-300">
                <Mail className="mx-auto mb-2 h-6 w-6 text-cyan-400" />
                <p className="font-orbitron mb-1 text-sm text-white">Email</p>
                <a
                  href="mailto:support@evalgaming.com"
                  className="text-cyan-400 transition-colors hover:text-cyan-300"
                >
                  support@evalgaming.com
                </a>
              </div>
              <div className="text-gray-300">
                <Phone className="mx-auto mb-2 h-6 w-6 text-purple-400" />
                <p className="font-orbitron mb-1 text-sm text-white">Phone</p>
                <a
                  href="tel:+12156781829"
                  className="text-purple-400 transition-colors hover:text-purple-300"
                >
                  +1 (215) 678-1829
                </a>
              </div>
              <div className="text-gray-300">
                <MapPin className="mx-auto mb-2 h-6 w-6 text-orange-400" />
                <p className="font-orbitron mb-1 text-sm text-white">
                  Location
                </p>
                <span className="text-orange-400">Princeton, NJ 08544</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success/Error Modal */}
      <Dialog
        open={modalState.isOpen}
        onOpenChange={(open) =>
          setModalState((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <DialogContent className="max-w-md border-gray-700 bg-gray-900 text-white">
          <DialogHeader>
            <DialogTitle className="font-orbitron flex items-center gap-3 text-xl">
              {modalState.type === "success" ? (
                <CheckCircle className="h-6 w-6 text-green-400" />
              ) : (
                <AlertCircle className="h-6 w-6 text-red-400" />
              )}
              {modalState.title}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="font-rajdhani leading-relaxed text-gray-300">
            {modalState.message}
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
}
