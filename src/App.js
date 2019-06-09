import React from 'react';
import axios from 'axios';

class App extends React.Component {

    state = {
        films: [],
        genres: [],
        filmCount: 0,
        hideNav: true,
        isSearching: false,
        hideFilterVote: true,
        hideFilterGenre: false,
        hideFilterLanguage: true,
    };

    async componentDidMount() {

        this.onWindowResize();
        window.addEventListener("resize", this.onWindowResize);

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
            const film = films.data.results[i];

            // Give genres actual names instead of ids.
            film.genres = film.genre_ids.reduce((str, id, i, a) =>
                i !== a.length - 1 ? str += genres[id] + ' | ' : str += genres[id], '');

            // Provide a shorter version of the film's overview
            film.shortText = film.overview.length > 160 ? film.overview.slice(0, 142) : film.overview;
            film.endShortText = film.overview.length > 160 ? film.overview.slice(142, 160) : film.overview;
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

    onFilter = ({ target: { name, value } }) => {
        console.log(name, ':', value);
    };

    // Resize main element (containing the film cards) depending on screen width.
    // Also shorten text if screen width < 768px.
    onWindowResize = () => {

        const width = window.innerWidth;

        if (width < 1024) {

            this._main.style.width = window.innerWidth - 90 + 'px';

        } else if (width < 1440) {

            this._main.style.width = window.innerWidth - 425 + 'px';

        } else {

            this._main.style.width = window.innerWidth - 885 + 'px';

            // This ensures the menu resets if resizing multiple times.
            if (this.state.hideNav) this.setState({ hideNav: true });
        }


        if (width < 768) {

            if (!this.state.shortText) this.setState({ shortText: true });

        } else {

            if (this.state.shortText) this.setState({ shortText: false });

        }

    };

    renderBurger = (name, page) => {
        return <div className={`burger ${name ? name : ''} ${this.state.hideNav}`} onClick={() => this.setState({ hideNav: !this.state.hideNav })}>
            <div />
            <div />
            <div />

            {/* This is hardcoded in the render html, would be good to save which tab the user is on so this can be dynamic. */}
            {page && <h1>{page}</h1>}
        </div>
    };

    render() {

        // if (this.state.films.length) console.log(this.state.genres);
        return <div className="App">

            {this.renderBurger('', 'Discover')}

            <div className={'mobile-nav'}>

                {this.renderBurger('', 'Discover')}

                <input type={'text'} placeholder={'Search for movies'} onChange={this.onSearch} />

                <div>
                    <img alt='calendar' src={require('./assets/year-icon.png')} />
                </div>

            </div>


            <nav className={'content ' + this.state.hideNav}>

                <div className={'nav-item'}>
                    <h1>Wesley</h1>
                    <img className={'dropdown'} alt='dropdown' src={require('./assets/arrow-icon.png')} />
                    {this.renderBurger('white')}
                </div>

                <div className={'nav-item active'}>
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


            <main ref={(el) => this._main = el} className={`${this.state.hideNav}`}>

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
                        {!this.state.shortText && <p className={'overview'}>{film.overview}</p>}
                        {this.state.shortText && <p className={'overview small'}>
                            {film.shortText}
                            <span>{film.endShortText}</span>
                        </p>}
                        <p className={'date'}>{film.release_date}</p>
                    </div>
                </div>)}

            </main>


            {/* It would be good to dynamically get these genres and languages, so that they are always up to date.
                It might not look exactly like the mockup though. */}
            <aside>

                <div>
                    <input type={'text'} className={'search'} placeholder={'Search for movies'} onChange={this.onSearch} />
                    <input type={'text'} className={'date'} placeholder={'Year of Release'} onChange={this.onSearch} />
                </div>

                <div>

                    <h1>Movie</h1>

                    <div className={'collapsible'}>
                        <div className={'horizontal bar'} />
                        {this.state.hideFilterGenre && <div className={'vertical bar'} />}
                        <div className={'button-container'}>
                            <button onClick={() => this.setState({ hideFilterGenre: !this.state.hideFilterGenre })}>Select Genre(s)</button>
                        </div>
                        {!this.state.hideFilterGenre && <ul>
                            <li>
                                <input type={'checkbox'} name={'genre'} id={'Action'} value='Action' onChange={this.onFilter} />
                                <label htmlFor={'Action'}/>
                                Action
                            </li>
                            <li>
                                <input type={'checkbox'} name={'genre'} id={'Adventure'} value='Adventure' onChange={this.onFilter} />
                                <label htmlFor={'Adventure'}/>
                                Adventure
                            </li>
                            <li>
                                <input type={'checkbox'} name={'genre'} id={'Animation'} value='Animation' onChange={this.onFilter} />
                                <label htmlFor={'Animation'}/>
                                Animation
                            </li>
                            <li>
                                <input type={'checkbox'} name={'genre'} id={'Comedy'} value='Comedy' onChange={this.onFilter} />
                                <label htmlFor={'Comedy'}/>
                                Comedy
                            </li>
                            <li>
                                <input type={'checkbox'} name={'genre'} id={'Crime'} value='Crime' onChange={this.onFilter} />
                                <label htmlFor={'Crime'}/>
                                Crime Film
                            </li>
                            <li>
                                <input type={'checkbox'} name={'genre'} id={'Documentary'} value='Documentary' onChange={this.onFilter} />
                                <label htmlFor={'Documentary'}/>
                                Documentary
                            </li>
                            <li>
                                <input type={'checkbox'} name={'genre'} id={'Drama'} value='Drama' onChange={this.onFilter} />
                                <label htmlFor={'Drama'}/>
                                Drama
                            </li>
                            <li>
                                <input type={'checkbox'} name={'genre'} id={'Erotic'} value='Erotic' onChange={this.onFilter} />
                                <label htmlFor={'Erotic'}/>
                                Erotic
                            </li>
                            <li>
                                <input type={'checkbox'} name={'genre'} id={'Family'} value='Family' onChange={this.onFilter} />
                                <label htmlFor={'Family'}/>
                                Family
                            </li>
                            <li>
                                <input type={'checkbox'} name={'genre'} id={'Fantasy'} value='Fantasy' onChange={this.onFilter} />
                                <label htmlFor={'Fantasy'}/>
                                Fantasy
                            </li>
                            <li>
                                <input type={'checkbox'} name={'genre'} id={'History'} value='History' onChange={this.onFilter} />
                                <label htmlFor={'History'}/>
                                History
                            </li>
                            <li>
                                <input type={'checkbox'} name={'genre'} id={'Horror'} value='Horror' onChange={this.onFilter} />
                                <label htmlFor={'Horror'}/>
                                Horror
                            </li>
                        </ul>}
                    </div>

                    <div className={'collapsible'}>
                        <div className={'horizontal bar'} />
                        {this.state.hideFilterVote && <div className={'vertical bar'} />}
                        <div className={'button-container'}>
                            <button onClick={() => this.setState({ hideFilterVote: !this.state.hideFilterVote })}>Select min. vote</button>
                        </div>
                        {!this.state.hideFilterVote && <ul>
                            <li>
                                <input type={'checkbox'} name={'vote'} id={'Label'} value='Label' onChange={this.onFilter} />
                                <label htmlFor={'Label'}/>
                                Label
                            </li>
                        </ul>}
                    </div>

                    <div className={'collapsible'}>
                        <div className={'horizontal bar'} />
                        {this.state.hideFilterLanguage && <div className={'vertical bar'} />}
                        <div className={'button-container'}>
                            <button onClick={() => this.setState({ hideFilterLanguage: !this.state.hideFilterLanguage })}>Select language</button>
                        </div>
                        {!this.state.hideFilterLanguage && <ul>
                            <li>
                                <input type='checkbox' name={'language'} value='label' id='label' onChange={this.onFilter} />
                                <label htmlFor={'label'}/>
                                label
                            </li>
                        </ul>}
                    </div>

                </div>

            </aside>


        </div>;
    }
}



export default App;
