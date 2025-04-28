import axios from 'axios';

const BASE_URL = 'http://192.168.17.236:5000/api'

export const customAxios = axios.create({
    baseURL: BASE_URL,
    timeout: 5000
})