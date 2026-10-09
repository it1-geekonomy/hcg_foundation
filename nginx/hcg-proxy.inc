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
}

location / {
    proxy_pass http://hcg_frontend;
}
