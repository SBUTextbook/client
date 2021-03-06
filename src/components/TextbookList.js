import React from 'react';
import Paper from '@material-ui/core/Paper';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { Grid, Table, TableHeaderRow, TableColumnResizing } from '@devexpress/dx-react-grid-material-ui';
import { DataTypeProvider, SortingState, IntegratedSorting } from '@devexpress/dx-react-grid';
import axios from 'axios';

const columns = [
    { name: 'course', title: 'Course' },
    { name: 'textbook', title: 'Textbook' },
    { name: 'md5', title: 'Download' },
];

const LibgenLinkFormatter = ({ value }) => {
    return (
        <span>
            <a href={`http://gen.lib.rus.ec/book/index.php?md5=${value}`}>Download </a>
        </span>
    );
} 

const LibgenLinkProvider = props => (
  <DataTypeProvider
    formatterComponent={LibgenLinkFormatter}
    {...props}
  />
);

export default class TextbookList extends React.Component {
    state = {
        textbooks: [],
        search: '',
        loaded: false,
    };

    async componentDidMount() {
        
        const url = 'https://sbutextbooks.herokuapp.com/books';
        const res = await axios.get(url);
        this.setState({
            textbooks: res.data.textbooks.map((textbook) => {
                return {
                    course: `${textbook.course.toUpperCase().substring(0, 3)} ${textbook.course.substring(3)}`,
                    textbook: `${textbook.title} (${textbook.edition} edition),
                               ${textbook.author}`,
                    md5: textbook.md5,
                    approved: textbook.approved,
                };
            })
        });
        this.setState({ loaded: true });
    }
    render() {
        if (!this.state.loaded) {
            return <span>Loading...</span>
        }
        return (
            <div style={{margin: '2em'}}>
                <a href='https://sbutextbook.github.io/beta/#/upload/'><Button style={{backgroundColor:'grey'}}>Upload</Button></a>
                <hr />
                <Autocomplete
                    options={this.state.textbooks.map(textbook => textbook.course).sort()}
                    renderInput={(params) => <TextField {...params} label="Course" variant="outlined" 
                    onChange={event => this.setState({ search: event.target.value })}
                    />}
                />
                <Paper>
                    <Grid rows={this.state.textbooks.filter(textbook => textbook.approved && textbook.course.includes(this.state.search.toUpperCase()))} columns={columns}>
                        <SortingState defaultSorting={[{ columnName: 'course', direction: 'asc' }]} />
                        <IntegratedSorting />
                        <LibgenLinkProvider for={['md5']} />
                        <Table />
                        <TableColumnResizing defaultColumnWidths={[
                            { columnName: 'course', width: 180 },
                            { columnName: 'textbook', width: 1200 },
                            { columnName: 'md5', width: 180 },
                            ]} />
                        <TableHeaderRow />
                    </Grid>
                </Paper>
            </div>
        )
    }
}
