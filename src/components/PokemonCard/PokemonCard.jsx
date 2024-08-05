import './PokemonCard.scss'
import { Link } from 'react-router-dom'

const PokemonCard = ({ pokemon }) => {

  const typeClasses = pokemon.types.map(type => type.type.name).join(' ');

  return (
    <div className={`card ${typeClasses}`}>
      <Link to={`/pokemon/${pokemon.id}`}>
        <img src={pokemon.sprites.other['official-artwork'].front_default || '/path/to/placeholder.png'}
          alt={pokemon.name} />
      </Link>
      <p className='id'>N° {String(pokemon.id).padStart(4, '0')}</p>
      <h3>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
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
