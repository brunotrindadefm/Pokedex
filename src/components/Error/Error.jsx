import './Error.scss'
import { TbError404 } from 'react-icons/tb'

const Error = ({error, query}) => {

  const errorMessage = error && error.message ? error.message : "An unknown error occurred";

    if (query.length > 30) {
        query = `${query.substring(0,15)}...`
    }

  return (
    <div className="error">
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
