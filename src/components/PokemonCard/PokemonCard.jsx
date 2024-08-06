import './PokemonCard.scss'
import { Link } from 'react-router-dom'

import AOS from 'aos';
import 'aos/dist/aos.css'

import { useEffect } from 'react';

const PokemonCard = ({ pokemon }) => {

  const typeClasses = pokemon.types.map(type => type.type.name).join(' ');

  const name = pokemon.name.split('-')[0];

  useEffect(() => {
    AOS.init()
  },[])

  return (
    <div className={`card ${typeClasses}`} data-aos="fade-in" data-aos-duration="900">
      <Link to={`/pokemon/${pokemon.id}`}>
        <img src={pokemon.sprites.other['official-artwork'].front_default || '/path/to/placeholder.png'}
          alt={pokemon.name} />
      </Link>
      <p className='id'>N° {String(pokemon.id).padStart(4, '0')}</p>
      <h3>{name.charAt(0).toUpperCase() + name.slice(1)}</h3>
      <div className='types'>
        {pokemon.types.map((type) => (
          <span key={type.type.name} className={`type ${type.type.name}`}>
            {type.type.name}
          </span>
        ))}
      </div>
    </div>
  )
}

export default PokemonCard
