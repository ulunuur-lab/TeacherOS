FROM alpine:3.19

RUN apk add --no-cache perl perl-io-socket-ssl perl-json-pp curl bash ca-certificates

WORKDIR /app

COPY . ./

RUN mkdir -p bot && \
    ([ -f bot.pl ] && cp bot.pl bot/ || true) && \
    ([ -f database.json ] && cp database.json bot/ || true) && \
    chmod +x entrypoint.sh server.pl bot/bot.pl 2>/dev/null || true

ENV PORT=8080
EXPOSE 8080

CMD ["./entrypoint.sh"]
