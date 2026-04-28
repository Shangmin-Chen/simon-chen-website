export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle contact form submissions
    if (url.pathname === '/api/contact' && request.method === 'POST') {
      try {
        const body = await request.json();

        if (!body.name || !body.email || !body.message || !body.subject) {
          return new Response(JSON.stringify({ error: 'Missing fields' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const emailjsResponse = await fetch(
          'https://api.emailjs.com/api/v1.0/email/send',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              service_id: env.EMAILJS_SERVICE_ID,
              template_id: env.EMAILJS_TEMPLATE_ID,
              user_id: env.EMAILJS_PUBLIC_KEY,
              template_params: {
                name: body.name,
                email: body.email,
                message: body.message,
                subject: body.subject,
              },
            }),
          }
        );

        if (!emailjsResponse.ok) {
          const text = await emailjsResponse.text();
          return new Response(
            JSON.stringify({ error: 'Send failed', detail: text }),
            {
              status: 502,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch {
        return new Response(JSON.stringify({ error: 'Bad request' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return env.ASSETS.fetch(request);
  },
};
