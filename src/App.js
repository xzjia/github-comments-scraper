import React, { Component } from 'react';
import { Button, Form, Card, Container} from 'react-bootstrap';
import LoadingOverlay from 'react-loading-overlay';
import {PacmanLoader} from 'react-spinners';
import { CSVLink } from "react-csv";

import 'bootstrap/dist/css/bootstrap.css';

const Octokit = require('@octokit/rest');

class App extends Component {

  state = {
    loading: false,
    githubToken: "",
    targetRepo: "",
    targetUser: "",
    comments: []
  }

  handleInputChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleClick = () => {
    const octokit = new Octokit ({
      auth: `token ${this.state.githubToken}`
    });
    this.setState({loading: true});
    octokit.paginate(`/GET /repos/${this.state.targetRepo}/pulls/comments`)
      .then(response => {
        console.log(response);
        this.setState({
          comments: response.filter(comment => {
            if (this.state.targetUser.length > 0) {
              return "login" in comment.user && comment.user.login === this.state.targetUser
            } else {
              return true;
            }
          }).map(raw_comment => {
            return {
              "created_at": raw_comment.created_at,
              "body": raw_comment.body,
              "html_url": raw_comment.html_url,
              "user": "login" in raw_comment.user && raw_comment.user.login,
            }
          }),
          loading: false
        })
      })
  }

  render() {
    return (
      <LoadingOverlay
        active={this.state.loading}
        spinner={<PacmanLoader />}
      >
      <Container>
        <header>
          <h1>Github Comments Scraper</h1>
        </header>
        <Form>
          <Form.Group controlId="githubToken">
            <Form.Label>Github Token</Form.Label>
            <Form.Control type="text" name="githubToken" onChange={this.handleInputChange} placeholder="Github Access Token, if none is given, then only public repositories will be accessible." />
          </Form.Group>
          <Form.Group controlId="targetRepo">
            <Form.Label>Target repository</Form.Label>
            <Form.Control type="text" name="targetRepo" onChange={this.handleInputChange} placeholder="Target repository, e.g. facebook/react" />
          </Form.Group>
          <Form.Group controlId="targetUser">
            <Form.Label>Target user name</Form.Label>
            <Form.Control type="text" name="targetUser" onChange={this.handleInputChange} placeholder="Target user name, e.g. xzjia. If none is given, all comments will show up." />
          </Form.Group>
          <Button onClick={this.handleClick} variant="primary">Submit</Button>
          {this.state.comments.length > 0 && <CSVLink data={this.state.comments}>Download</CSVLink>}
        </Form>
        {this.state.comments.map((comment, index) => (
          <Card key={index} style={{ width: '18rem' }}>
            <Card.Body>
              <Card.Title>Review Comment</Card.Title>
              <Card.Subtitle>{comment.user} at {comment.created_at}</Card.Subtitle>
              <Card.Text>{comment.body}</Card.Text>
              <Card.Link href={comment.html_url}>Link</Card.Link>
            </Card.Body>
          </Card>
        ))}
      </Container>;
      </LoadingOverlay>
    );
  }
}

export default App;
