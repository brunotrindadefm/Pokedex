import './Navbar.scss'

import { MdOutlineSearch } from "react-icons/md";
import { CgPokemon } from "react-icons/cg";

import { useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {

  const [search, setSearch] = useState('')
  const navigate = useNavigate();

  const handleSearch = (e) => {
      e.preventDefault();
      if (!search) return;

      navigate(`/search?q=${search}`);
      setSearch('')
  }

  return (
    <nav className='navbar'>
      <div className='title'>
        <Link to='/'>
          <CgPokemon />
          <h1>BT<span>Pokedex</span></h1>
        </Link>
      </div>
      <form className='form' onSubmit={handleSearch}>
        <input type="text" onChange={(e) => setSearch(e.target.value)} value={search} placeholder='Pesquise o Pokémon' />
        <button type='submit'><MdOutlineSearch /></button>
      </form>
    </nav>
  )
}

export default Navbar
