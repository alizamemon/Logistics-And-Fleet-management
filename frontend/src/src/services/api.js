import axios from 'axios';
const API_BASE_URL = "http://logistics-alb-1796139297.us-east-1.elb.amazonaws.com";
const API= axios.create({
    baseURL: '/api',
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