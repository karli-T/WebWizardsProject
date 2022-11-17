# code from CSE 312 Slides
FROM python:3.8

ENV HOME /root

WORKDIR /root

COPY . .

# Download dependancies

RUN pip3 install -r requirements.txt

EXPOSE 8000

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait

RUN chmod +x /wait

CMD ["python3", "-u", "-m", "flask", "run", "--host=0.0.0.0", "-p", "8000"]

# docker-compose up --build --force-recreate  
# docker-compose up
# docker-compose retart