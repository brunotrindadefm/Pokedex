import './PokemonCard.scss'
import { Link } from 'react-router-dom'

const PokemonCard = ({key, pokemon}) => {

    console.log(pokemon)

  return (
    <div key={key} className='card'>
        <Link to='/pokemon'><img src={pokemon.sprites.front_default} alt={pokemon.name} /></Link>
        <p className='id'>{pokemon.id}</p>
        <h3>{pokemon.name}</h3>
        <p> {pokemon.types.map((type) => type.type.name).join(", ")}</p>
    </div>
  )
}

export default PokemonCard
