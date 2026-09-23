FROM alpine:3.19

# Install Perl, curl, SSL certificates
RUN apk add --no-cache perl perl-io-socket-ssl perl-json-pp curl bash ca-certificates

WORKDIR /app

# Copy application files
COPY server.pl ./
COPY index.html ./
COPY bot ./bot
COPY entrypoint.sh ./

RUN chmod +x entrypoint.sh server.pl bot/bot.pl

ENV PORT=8080
EXPOSE 8080

CMD ["./entrypoint.sh"]
