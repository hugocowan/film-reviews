import React from 'react';
import axios from 'axios';

class App extends React.Component {

    state = {
        films: [],
        filmCount: 0,
        genres: [],
        isSearching: false,
        hideFilterVote: true,
        hideFilterGenre: false,
        hideFilterLanguage: true,
    };

    async componentDidMount() {

        // Get initial film data for when the page loads.
        const [ films, genres ] = await Promise.all([
            axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${process.env.REACT_APP_KEY_V3}` +
                      `&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1`),
            axios.get(`https://api.themoviedb.org/3/genre/movie/list?language=en-US&api_key=${process.env.REACT_APP_KEY_V3}`)
        ]);

        this.setState({ ...this.prepareData(films, genres) });
    }


    // Prepare data for rendering
    prepareData = (films, genres) => {

        // Check if genres needs processing.
        if (genres.hasOwnProperty('status')) {

            genres = genres.data.genres.reduce((object, genre) => {
                object[genre.id] = genre.name;
                return object;
            }, {});
        }

        for (let i = 0; i < films.data.results.length - 1; i++) {

            films.data.results[i].genres = films.data.results[i].genre_ids.reduce((str, id, i, a) =>
                i !== a.length - 1 ? str += genres[id] + ' | ' : str += genres[id], '');
        }

        return { films: films.data.results, filmCount: films.data.total_results, genres };
    };


    //Search for films matching user input. This is in desperate need of rate throttling/debouncing.
    onSearch = ({ target: { value } }) => {

        if (this.state.isSearching === false) {

            this.setState({ isSearching: true }, () => {

                axios
                    .get(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.REACT_APP_KEY_V3}`+
                        `&language=en-US&query=${value}&page=1&include_adult=false`)
                    .then(_films => this.setState({ ...this.prepareData(_films, this.state.genres), isSearching: false }));
            });
        }
    };


    render() {

        // if (this.state.films.length) console.log(this.state.genres);
        return <div className="App">

            <nav>
                <div className={'nav-item'}>
                    <h1>Wesley</h1>
                    <img className={'dropdown'} alt='dropdown' src={require('./assets/arrow-icon.png')} />
                </div>
                <div className={'nav-item'}>
                    <h1>Discover</h1>
                    <img className={'search'} alt='dropdown' src={require('./assets/search-icon-white.png')} />
                </div>
                <div className={'nav-item title'}>
                    <h1>Watched</h1>
                </div>
                <div className={'nav-item small'}>
                    <h2>Movies</h2>
                </div>
                <div className={'nav-item small'}>
                    <h2>TV Shows</h2>
                </div>
                <div className={'nav-item title'}>
                    <h1>Saved</h1>
                </div>
                <div className={'nav-item small'}>
                    <h2>Movies</h2>
                </div>
                <div className={'nav-item small'}>
                    <h2>TV Shows</h2>
                </div>
            </nav>

            <main>
                <p>{this.state.filmCount} movies</p>
                {this.state.films.map(film =>
                <div key={film.id} className={'card'}>
                    <div className={'poster'}>
                        <img
                            alt='poster'
                            src={film.poster_path ?
                            `https://image.tmdb.org/t/p/w185/${film.poster_path}` :
                            'https://via.placeholder.com/185x278?text=No+Image'}
                        />
                    </div>
                    <div className={'content'}>
                        <div className={'header'}>
                            <h1>{film.title}</h1>
                            <span className={'rating'}>{film.vote_average}</span>
                            <p className={'genre'}>{film.genres}</p>
                        </div>
                        <p>{film.overview}</p>
                        <p className={'date'}>{film.release_date}</p>
                    </div>
                </div>)}
            </main>

            <aside>
                <div>
                    <input type={'text'} className={'search'} placeholder={'Search'} onChange={this.onSearch} />
                    <input type={'text'} className={'date'} placeholder={'Year of Release'} onChange={this.onSearch} />
                </div>
                <div>
                    <h1>Movie</h1>
                    <div className={'collapsible'}>
                        <div className={'horizontal bar'} />
                        {this.state.hideFilterGenre && <div className={'vertical bar'} />}
                        <div className={'button-container'}>
                            <a onClick={() => this.setState({ hideFilterGenre: !this.state.hideFilterGenre })}>Select Genre(s)</a>
                        </div>
                        {!this.state.hideFilterGenre && <ul>
                            <li>Action</li>
                            <li>Adventure</li>
                            <li>Animation</li>
                            <li>Comedy</li>
                            <li>Crime Film</li>
                            <li>Documentary</li>
                            <li>Drama</li>
                            <li>Erotic</li>
                            <li>Family</li>
                            <li>Fantasy</li>
                            <li>History</li>
                            <li>Horror</li>
                        </ul>}
                    </div>
                    <div className={'collapsible'}>
                        <div className={'horizontal bar'} />
                        {this.state.hideFilterVote && <div className={'vertical bar'} />}
                        <div className={'button-container'}>
                            <a onClick={() => this.setState({ hideFilterVote: !this.state.hideFilterVote })}>Select min. vote</a>
                        </div>
                        {!this.state.hideFilterVote && <ul>
                            <li>Label</li>
                        </ul>}
                    </div>
                    <div className={'collapsible'}>
                        <div className={'horizontal bar'} />
                        {this.state.hideFilterLanguage && <div className={'vertical bar'} />}
                        <div className={'button-container'}>
                            <a onClick={() => this.setState({ hideFilterLanguage: !this.state.hideFilterLanguage })}>Select language</a>
                        </div>
                        {!this.state.hideFilterLanguage && <ul>
                            <li>Label</li>
                        </ul>}
                    </div>
                </div>
            </aside>

        </div>;
    }
}



export default App;
