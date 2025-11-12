# Shangmin Chen - Portfolio Website

A modern, responsive portfolio website built with React, featuring smooth animations, contact form integration, and containerized deployment with Docker.

## 🚀 Live Demo

Visit the live website: [https://shangmin.me](https://shangmin.me)

## 🛠️ Tech Stack

- **Frontend**: React 19.1.0, JavaScript (ES6+)
- **Styling**: CSS3 with custom animations
- **Email Service**: EmailJS for client-side email functionality
- **Smooth Scrolling**: Lenis for enhanced user experience
- **Containerization**: Docker with multi-stage builds
- **Web Server**: Nginx for production serving

## 🐳 Quick Start with Docker

### Prerequisites:
- [Docker](https://www.docker.com/get-started) (version 20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (optional, but recommended)

### Option 1: Using Docker Compose (Recommended)

1. **Clone the Repository**
   ```bash
   git clone https://github.com/shangmin-chen/Shangmin-Chen.github.io.git
   cd Shangmin-Chen.github.io
   ```

2. **Set Environment Variables (Optional)**

   If you need EmailJS functionality, create a `.env` file:
   ```env
   REACT_APP_EMAILJS_SERVICE_ID=your_service_id_here
   REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id_here
   REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key_here
   ```

   Then uncomment the `args` section in `docker-compose.yml`:
   ```yaml
   build:
     context: .
     dockerfile: Dockerfile
     args:
       - REACT_APP_EMAILJS_SERVICE_ID=${REACT_APP_EMAILJS_SERVICE_ID}
       - REACT_APP_EMAILJS_TEMPLATE_ID=${REACT_APP_EMAILJS_TEMPLATE_ID}
       - REACT_APP_EMAILJS_PUBLIC_KEY=${REACT_APP_EMAILJS_PUBLIC_KEY}
   ```

3. **Build and Run**
   ```bash
   docker-compose up --build
   ```

4. **Access the Application**
   
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

### Option 2: Using Docker Directly

1. **Build the Docker Image**
   ```bash
   docker build -t shangmin-portfolio .
   ```
   
   **With Environment Variables:**
   ```bash
   docker build \
     --build-arg REACT_APP_EMAILJS_SERVICE_ID=your_service_id \
     --build-arg REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id \
     --build-arg REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key \
     -t shangmin-portfolio .
   ```

2. **Run the Container**
   ```bash
   docker run -d -p 3000:80 --name shangmin-portfolio shangmin-portfolio
   ```

3. **Access the Application**
   
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## 📋 Docker Commands

### Basic Operations

```bash
# Build the image
docker build -t shangmin-portfolio .

# Run the container
docker run -p 3000:80 shangmin-portfolio

# Run in detached mode
docker run -d -p 3000:80 --name shangmin-portfolio shangmin-portfolio

# Stop the container
docker stop shangmin-portfolio

# Start a stopped container
docker start shangmin-portfolio

# Remove the container
docker rm shangmin-portfolio

# View running containers
docker ps

# View container logs
docker logs shangmin-portfolio

# Follow container logs
docker logs -f shangmin-portfolio
```

### Docker Compose Commands

```bash
# Build and start services
docker-compose up --build

# Start services in detached mode
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs

# Follow logs
docker-compose logs -f

# Rebuild without cache
docker-compose build --no-cache

# Stop and remove containers, networks
docker-compose down -v
```

## 🏗️ Docker Architecture

The Docker setup uses a **multi-stage build** for optimal image size and performance:

### Stage 1: Builder
- Uses `node:20-alpine` as base image
- Installs dependencies with `npm ci`
- Builds the React application
- Creates optimized production bundle

### Stage 2: Production
- Uses `nginx:alpine` as base image (lightweight)
- Copies built static files from builder stage
- Configures nginx for:
  - React Router support (SPA routing)
  - Gzip compression
  - Static asset caching
  - Security headers
  - Health check endpoint

### Features:
- ✅ **Small Image Size**: Multi-stage build reduces final image size
- ✅ **Production Ready**: Optimized nginx configuration
- ✅ **Health Checks**: Built-in health monitoring
- ✅ **SPA Support**: Proper routing for React Router
- ✅ **Performance**: Gzip compression and asset caching
- ✅ **Security**: Security headers configured

## 📧 EmailJS Setup

If you need the contact form to work, you'll need to configure EmailJS:

1. **Create EmailJS Account**
   - Sign up at [EmailJS](https://www.emailjs.com/)
   - Verify your email address

2. **Create Email Service and Template**
   - Follow the EmailJS setup guide in `pre-migration.md`
   - Get your Service ID, Template ID, and Public Key

3. **Pass Environment Variables**
   
   **For Docker Compose:**
   - Add variables to `.env` file
   - Uncomment `args` section in `docker-compose.yml`
   
   **For Docker Build:**
   - Use `--build-arg` flags when building
   - Or create a `.env` file and use it with build args

## 🔧 Configuration

### Port Configuration

To change the port mapping, modify `docker-compose.yml`:
```yaml
ports:
  - "YOUR_PORT:80"  # Change YOUR_PORT to desired port
```

Or with Docker directly:
```bash
docker run -p YOUR_PORT:80 shangmin-portfolio
```

### Nginx Configuration

The nginx configuration is in `nginx.conf`. You can customize:
- Server settings
- Compression settings
- Cache policies
- Security headers

After modifying, rebuild the image:
```bash
docker-compose build --no-cache
```

## 🚀 Deployment

### Deploy to Cloud Platforms

The Docker container can be deployed to various platforms:

**Docker Hub:**
```bash
# Tag the image
docker tag shangmin-portfolio yourusername/shangmin-portfolio

# Push to Docker Hub
docker push yourusername/shangmin-portfolio
```

**AWS ECS, Google Cloud Run, Azure Container Instances:**
- Use the Dockerfile directly
- Platforms will build and deploy automatically

**VPS/Server:**
```bash
# On your server
docker pull yourusername/shangmin-portfolio
docker run -d -p 80:80 --name portfolio shangmin-portfolio
```

### Environment Variables in Production

For production deployments, pass environment variables at build time:
- Use build args during image build
- Or use platform-specific secret management
- Never commit sensitive keys to the repository

## 🔍 Health Check

The container includes a health check endpoint at `/health`. You can verify the container is running:

```bash
# Check health status
docker ps  # Look for "healthy" status

# Test health endpoint
curl http://localhost:3000/health
```

## 🐛 Troubleshooting

### Container Won't Start
```bash
# Check logs
docker logs shangmin-portfolio

# Check if port is already in use
lsof -i :3000
```

### Build Fails
```bash
# Clear Docker cache
docker builder prune

# Rebuild without cache
docker-compose build --no-cache
```

### Environment Variables Not Working
- Ensure variables are passed at **build time** (not runtime)
- React environment variables must start with `REACT_APP_`
- Rebuild the image after changing environment variables

### Can't Access Application
- Verify container is running: `docker ps`
- Check port mapping: `docker port shangmin-portfolio`
- Ensure firewall allows the port
- Try accessing `http://localhost:3000` or `http://127.0.0.1:3000`

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [React Documentation](https://reactjs.org/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [EmailJS Documentation](https://www.emailjs.com/docs/)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

This is a personal portfolio website, but suggestions and improvements are welcome! Feel free to open an issue or submit a pull request.

---

**Built with ❤️ by Shangmin Chen**
