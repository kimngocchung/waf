# Dockerfile (Dành cho Development)

# Bắt đầu từ một image Node.js
FROM node:18-alpine

# Đặt thư mục làm việc bên trong container
WORKDIR /app

# Sao chép package.json và package-lock.json
COPY package.json package-lock.json* ./

# Cài đặt các gói phụ thuộc
RUN npm install

# Sao chép toàn bộ mã nguồn còn lại
COPY . .

# Mở cổng 3000
EXPOSE 3000

# Lệnh để chạy server development
# HOST 0.0.0.0 là cần thiết để có thể truy cập từ bên ngoài container
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]