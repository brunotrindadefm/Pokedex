import './Error.scss'
import { TbError404 } from 'react-icons/tb'

import AOS from 'aos';
import 'aos/dist/aos.css'; 

import { useEffect } from 'react';

const Error = ({error, query}) => {

  const errorMessage = error && error.message ? error.message : "An unknown error occurred";

    if (query.length > 30) {
        query = `${query.substring(0,15)}...`
    }

  useEffect(() => {
    AOS.init();
  },[])

  return (
    <div className="error" data-aos="fade-in" data-aos-duration="1000">
            <p>{errorMessage}</p>
            <p><span className='query-text'>{query}</span></p>
            <div className='error404'>
                <TbError404 />
                <p>Not Found</p>
            </div>
    </div>
  )
}

export default Error
