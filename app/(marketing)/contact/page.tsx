"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/brand/section-heading";
import { MapPin, Phone, Mail } from "lucide-react";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(3),
  message: z.string().min(10),
});

type FormData = z.infer<typeof schema>;

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    // In production this would POST to an API
    await new Promise((r) => setTimeout(r, 800));
    setSent(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <SectionHeading title="Contact Us" subtitle="We'd love to hear from you." className="mb-10" />

      <div className="grid md:grid-cols-2 gap-12">
        {/* Contact info */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-display font-semibold text-ink mb-4">Get in Touch</h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gold-deep shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-ink">Physical Address</p>
                  <p className="text-muted-foreground">Zogreo College, Nairobi, Kenya</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gold-deep shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-ink">Phone / WhatsApp</p>
                  <p className="text-muted-foreground">+254 700 000 000</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gold-deep shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-ink">Email</p>
                  <p className="text-muted-foreground">admissions@zogreo.ac.ke</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-canvas border p-5">
            <h3 className="font-display font-semibold text-ink mb-2">Office Hours</h3>
            <p className="text-sm text-muted-foreground">Monday – Friday: 8:00 AM – 5:00 PM</p>
            <p className="text-sm text-muted-foreground">Saturday: 9:00 AM – 1:00 PM</p>
          </div>
        </div>

        {/* Form */}
        <div>
          {sent ? (
            <div className="rounded-xl bg-success/10 border border-success/20 p-8 text-center">
              <p className="text-2xl mb-2">✓</p>
              <h3 className="font-display font-semibold text-ink mb-1">Message sent!</h3>
              <p className="text-sm text-muted-foreground">We'll get back to you within one business day.</p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Jane Doe" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="jane@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="subject" render={({ field }) => (
                  <FormItem><FormLabel>Subject</FormLabel><FormControl><Input placeholder="Enquiry about ICT program" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="message" render={({ field }) => (
                  <FormItem><FormLabel>Message</FormLabel><FormControl><Textarea rows={5} placeholder="Your message…" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Sending…" : "Send Message"}
                </Button>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
