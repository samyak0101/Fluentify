# TypeScript Express Server

This is a simple Node.js and Express server written in TypeScript, containerized with Docker.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/) (Node Package Manager)

## Getting Started

1. Install Dependencies:
`npm install`
2. Build TypeScript code:
`npm run build`
3. Start the server 
`npm start`


## Docker

1. Build the Docker Image:
`docker build -t server .`

2. Run the Docker container:
`docker run -p 8080:8080 server`

3. Access the Server at localhost:8080

### Deployment

## To Deploy to Fluentify GCP project

1. Set up connection and authentication with GCP

2. Set up Artifact Registry and Artifact Repository 

3. Run docker build and push to Artifact Registry, buildx is a special way to build dockerfile with both arm64 and amd so that GCP doesn't [freakout](https://cloud.google.com/kubernetes-engine/docs/how-to/build-multi-arch-for-arm)

`docker buildx build --platform linux/amd64,linux/arm64 -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/server/server:v6 . --push`

4. Deploy the docker image to GKE, pulling latest image from Artifact Registry (this can be automated through CodeBuild pipeline)
Optionally, you can do this all in the cli with kubectl:

* Create Deployment:
```
kubectl create deployment \                     
    server \
    --image=${REGION}-docker.pkg.dev/${PROJECT_ID}/server/server:version
```

* (Optionally) Scale or Autoscale the deployment clusters

* expose the LoadBalancer with mapping to the ports container 80:8080 
```
kubectl expose deployment \                     
    server \
    --name=fluentify-server-service \
    --type=LoadBalancer --port 80 \
    --target-port 8080
```

5. Watch your deployment fail

6. Cry and try again

7. Die

8. Heatdeath of the Universe

Optional:
* run `kubectl get service` to monitor critical health information about GKE clusters
