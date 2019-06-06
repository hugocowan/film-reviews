import React from 'react';
import axios from 'axios';

class App extends React.Component {

    state = {
        films: [],
        genres: []
    };

    // Cancel token for cancelling previous requests that could overload the client/trigger rate limiting
    _source = axios.CancelToken.source();


    async componentDidMount() {

        // Get initial film data for when the page loads.
        let [ films, genres ] = await Promise.all([
            axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${process.env.REACT_APP_KEY_V3}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1`, {
                cancelToken: this._source.token
            }),
            axios.get(`https://api.themoviedb.org/3/genre/movie/list?language=en-US&api_key=${process.env.REACT_APP_KEY_V3}`, {
                cancelToken: this._source.token
            })
        ]);

        [ films, genres ] = this.prepareData(films.data.results, genres.data.genres);

        this.setState({ films, genres });
    }


    // Prepare data for rendering
    prepareData = (films, genres) => {

        genres = genres.reduce((object, genre) => {
            object[genre.id] = genre.name;
            return object;
        }, {});

        for (let i = 0; i < films.length - 1; i++) {

            films[i].genres = films[i].genre_ids.reduce((str, id, i, a) =>
                i !== a.length - 1 ? str += genres[id] + ' | ' : str += genres[id], '');
        }

        return [ films, genres ];
    };

    render() {

        if (this.state.films.length) console.log(this.state.films[0]);
        return (
            <div className="App">

                {this.state.films.map(film =>
                <div key={film.id} className={'card'}>
                    <img alt='poster' src={`https://image.tmdb.org/t/p/w185/${film.poster_path}`} />
                    <h1>{film.title}</h1>
                    <span className={'rating'}>{film.vote_average}</span>
                    <p className={'genre'}>{film.genres}</p>
                    <p>{film.overview}</p>
                    <p className={'date'}>{film.release_date}</p>
                </div>)}

            </div>
        );
    }
}



export default App;
