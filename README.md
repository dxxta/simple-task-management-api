# Tasks API

Simple Management Tasks API

## Spesifications

### Hardware

| Component                  | Minimum                                             | Recommended\*                                   | Maximum   |
| -------------------------- | --------------------------------------------------- | ----------------------------------------------- | --------- |
| CPU socket                 | 1.3 GHz (64-bit processor) or faster for multi-core | 3.1 GHz (64-bit processor) or faster multi-core | 2 sockets |
| Memory (RAM)               | 8 GB                                                | 16 GB                                           | 64 GB     |
| Hard disks dan penyimpanan | 10 GB hard disk with a 60 GB system partition       |                                                 | No limit  |

### Software

- `node@18` or latest, see full documentation [official](https://www.docker.com/)
- `mysql`, see full documentation [official](https://www.docker.com/)
- `docker & docker compose`, see full documentation [official](https://www.docker.com/)

## Instalasi

1.  Make sure you have docker installed on your computer. You can donwload here [docker](https://docs.docker.com/engine/install/)
2.  Open terminal/shell on this folder
3.  Run this command on your terminal/shell

    ```
    docker compose up -d
    ```

4.  See full monitoring on [Docker Desktop](https://www.docker.com/products/docker-desktop/)
5.  Now the server can be accessed at [http://127.0.0.1:8801](http://127.0.0.1:8801)
6.  See the API documentation [http://127.0.0.1:8801/docs](http://127.0.0.1:8801/docs)
