add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
add_header Content-Security-Policy-Report-Only "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://cdn.razorpay.com https://maps.googleapis.com https://cdn.jsdelivr.net blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://checkout.razorpay.com https://cdn.jsdelivr.net; img-src 'self' data: blob: https://*.r2.dev https://*.razorpay.com https://maps.gstatic.com https://*.googleapis.com https://images.unsplash.com https://cdn.jsdelivr.net; font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net; connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com https://checkout.razorpay.com https://*.razorpay.com https://maps.googleapis.com https://photon.komoot.io https://*.r2.dev https://cdn.jsdelivr.net; media-src 'self' blob: data: https://*.r2.dev; frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://*.razorpay.com https://www.google.com https://www.youtube.com https://www.youtube-nocookie.com; frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self' https://api.razorpay.com https://*.razorpay.com; worker-src 'self' blob:;" always;


client_max_body_size 100m;

proxy_http_version 1.1;
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_read_timeout 120s;

# Next.js route handlers that share the /api prefix with the NestJS API
location ^~ /api/website-images {
    proxy_pass http://hcg_frontend;
}

location ^~ /api/download {
    proxy_pass http://hcg_frontend;
}

# CMS video uploads (patient testimonials, impact videos) go through the API.
location /api/ {
    client_max_body_size 2g;
    client_body_timeout 300s;
    proxy_send_timeout 600s;
    proxy_read_timeout 600s;
    proxy_pass http://hcg_backend;
}

# Hashed build files. A year is safe: the filename changes when the file does.
location /_next/static/ {
    proxy_pass http://hcg_frontend;
    proxy_hide_header Cache-Control;

    add_header Cache-Control "public, max-age=31536000, immutable" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    add_header Content-Security-Policy-Report-Only "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://cdn.razorpay.com https://maps.googleapis.com https://cdn.jsdelivr.net blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://checkout.razorpay.com https://cdn.jsdelivr.net; img-src 'self' data: blob: https://*.r2.dev https://*.razorpay.com https://maps.gstatic.com https://*.googleapis.com https://images.unsplash.com https://cdn.jsdelivr.net; font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net; connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com https://checkout.razorpay.com https://*.razorpay.com https://maps.googleapis.com https://photon.komoot.io https://*.r2.dev https://cdn.jsdelivr.net; media-src 'self' blob: data: https://*.r2.dev; frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://*.razorpay.com https://www.google.com https://www.youtube.com https://www.youtube-nocookie.com; frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self' https://api.razorpay.com https://*.razorpay.com; worker-src 'self' blob:;" always;
}

location / {
    proxy_pass http://hcg_frontend;
}
