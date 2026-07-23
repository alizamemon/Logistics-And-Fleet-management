import axios from 'axios';

const API= axios.create({
    baseURL: 'http://localhost:8080/api',
    headers:{
        'Content-Type': 'application/json',    //tell server you have JSON data
    }
});

//Interceptor will check localStorage on every req
API.interceptors.request.use(
        (config)=> {
        const token= localStorage.getItem('token');
        if(token){
            config.headers.Authorization = `Bearer ${token}`;
            console.log("Token injected into headers:",token);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);  //cant get data
    }
);

export default API;