export const metadata = {
  title: 'Contact | Schools Are Forests',
  description: 'Get in touch with the Schools Are Forests team.',
}

export default function ContactPage() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-forest-800 to-forest-500 text-white py-24 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
        <p className="text-forest-100 text-xl max-w-2xl mx-auto">
          Interested in partnering with us, volunteering, or just learning more?
          We'd love to hear from you.
        </p>
      </section>

      {/* ── Contact options ── */}
      <section className="py-16 px-4 bg-forest-50">
        <div className="max-w-3xl mx-auto grid md:grid-cols-3 gap-6 text-center">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-3xl mb-3">🌳</div>
            <h3 className="font-semibold text-forest-800 mb-2">Join Our Network</h3>
            <p className="text-gray-500 text-sm">Have a school tree inventory? We'd love to feature it.</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-3xl mb-3">🤝</div>
            <h3 className="font-semibold text-forest-800 mb-2">Partner With Us</h3>
            <p className="text-gray-500 text-sm">Schools, researchers, and organizations welcome.</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-3xl mb-3">💬</div>
            <h3 className="font-semibold text-forest-800 mb-2">Say Hello</h3>
            <p className="text-gray-500 text-sm">Questions, ideas, or just curious — reach out anytime.</p>
          </div>
        </div>
      </section>

      {/* ── Form ── */}
      <section className="py-20 px-4">
        <div className="max-w-xl mx-auto">

          {/* Direct email */}
          <div className="text-center mb-8">
            <p className="text-gray-500 text-sm mb-2">Or email us directly at</p>
            <a
              href="mailto:schoolsareforests@gmail.com"
              className="text-forest-700 font-semibold text-lg hover:underline"
            >
              schoolsareforests@gmail.com
            </a>
          </div>

          <form
            action="https://formspree.io/f/schoolsareforests@gmail.com"
            method="POST"
            className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100"
          >
            {/* Redirect after submit */}
            <input type="hidden" name="_next" value="https://schoolsareforests.org/contact?sent=1" />

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="name">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="Jane Doe"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="jane@example.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="subject">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  placeholder="How can we help?"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  placeholder="Tell us about your interest in Schools Are Forests…"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent transition resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-forest-700 text-white font-semibold py-3 rounded-lg hover:bg-forest-600 transition-colors"
              >
                Send Message
              </button>
            </div>
          </form>

          <p className="text-center text-xs text-gray-400 mt-5">
            We aim to respond within 2–3 business days.
          </p>
        </div>
      </section>
    </div>
  )
}
