# Stage 1: Build ModSecurity and the Nginx Connector from source
# We use a full Debian image here because it has all the build tools we need.
FROM debian:bullseye as builder

# Define versions as arguments to easily update them
ARG NGINX_VERSION=1.25.0
ARG MODSEC_VERSION=v3.0.12
ARG MODSEC_CONNECTOR_VERSION=v1.0.3

# Install all build dependencies in one layer
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    libtool \
    autoconf \
    automake \
    pkg-config \
    wget \
    unzip \
    zlib1g-dev \
    libpcre3-dev \
    libcurl4-openssl-dev \
    libxml2-dev \
    libyajl-dev \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set git to ignore SSL verification globally for all subsequent git commands
RUN git config --global http.sslVerify false

# Clone and compile ModSecurity
WORKDIR /usr/src
RUN git clone -b ${MODSEC_VERSION} --depth 1 https://github.com/owasp-modsecurity/ModSecurity.git
WORKDIR /usr/src/ModSecurity
RUN git submodule init && git submodule update
RUN ./build.sh
RUN ./configure
RUN make -j2
RUN make install

# Clone and compile the ModSecurity-Nginx connector
WORKDIR /usr/src
RUN wget http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz && tar -xvzf nginx-${NGINX_VERSION}.tar.gz
RUN git clone -b ${MODSEC_CONNECTOR_VERSION} --depth 1 https://github.com/owasp-modsecurity/ModSecurity-nginx.git
WORKDIR /usr/src/nginx-${NGINX_VERSION}
RUN ./configure --with-compat --add-dynamic-module=../ModSecurity-nginx
RUN make modules

# Stage 2: Build the final, lean Nginx image
FROM nginx:1.25-bullseye

# Copy the compiled dynamic module and the main library from the builder stage
COPY --from=builder /usr/src/nginx-1.25.0/objs/ngx_http_modsecurity_module.so /usr/lib/nginx/modules/
COPY --from=builder /usr/local/modsecurity/lib/libmodsecurity.so.3 /usr/lib/

# Insert the load_module directive at the top of the main nginx.conf
# This must be in the main configuration file, not in a server block.
RUN sed -i '1s/^/load_module \/usr\/lib\/nginx\/modules\/ngx_http_modsecurity_module.so;\n/' /etc/nginx/nginx.conf

# Create directories and set permissions for ModSecurity logs
RUN mkdir -p /etc/nginx/modsec /var/log/modsec/ && \
    chown -R nginx:nginx /var/log/modsec/

# Download and configure OWASP Core Rule Set (CRS)
RUN apt-get update && apt-get install -y --no-install-recommends wget unzip libyajl2 && \
    wget https://github.com/coreruleset/coreruleset/archive/refs/tags/v4.0.0.zip -O /usr/src/coreruleset.zip && \
    unzip /usr/src/coreruleset.zip -d /usr/src/ && \
    mv /usr/src/coreruleset-4.0.0 /etc/nginx/modsec/coreruleset && \
    mv /etc/nginx/modsec/coreruleset/crs-setup.conf.example /etc/nginx/modsec/coreruleset/crs-setup.conf && \
    # Create the main.conf file that includes the CRS rules
    echo "Include /etc/nginx/modsec/coreruleset/crs-setup.conf" > /etc/nginx/modsec/main.conf && \
    echo "Include /etc/nginx/modsec/coreruleset/rules/*.conf" >> /etc/nginx/modsec/main.conf && \
    # Clean up downloaded files
    rm /usr/src/coreruleset.zip && \
    # Clean up installed packages
    apt-get purge -y --auto-remove wget unzip && rm -rf /var/lib/apt/lists/*
