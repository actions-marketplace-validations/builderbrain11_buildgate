# Buildgate untrusted verification worker image.
# Build from repository root: docker build -t buildgate-worker:local -f infra/worker-sandbox/Dockerfile .
FROM node:20-alpine

RUN addgroup -S -g 10001 buildgate && adduser -S -u 10001 -G buildgate buildgate
WORKDIR /workspace
ENV NODE_ENV=test CI=true HOME=/tmp TMPDIR=/tmp
USER 10001:10001

# The host runner mounts a project read-only and a separate disposable /output.
# Runtime restrictions (no network, read-only root, resource quotas, dropped caps)
# are enforced by sandbox-runner.js, not by this image alone.
ENTRYPOINT ["node"]
