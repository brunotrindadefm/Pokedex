import './Loading.scss'

import AOS from 'aos';
import 'aos/dist/aos.css'; 

import { useEffect } from 'react';

const Loading = () => {

  useEffect(() => {
    AOS.init();
  },[])

  return <div className="loader" data-aos="fade-in" data-aos-duration="1000"></div>
}

export default Loading

