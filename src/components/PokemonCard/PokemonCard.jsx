import './PokemonCard.scss'
import { Link } from 'react-router-dom'

const PokemonCard = ({ pokemon}) => {

    console.log(pokemon)

  return (
    <div className='card'>
        <Link to={`/pokemon/${pokemon.id}`}><img src={pokemon.sprites.other['official-artwork'].front_default} alt={pokemon.name} /></Link>
        <p className='id'>{pokemon.id}</p>
        <h3>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
        <p> {pokemon.types.map((type) => type.type.name).join(", ")}</p>
    </div>
  )
}

export default PokemonCard
