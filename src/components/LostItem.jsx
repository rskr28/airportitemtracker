import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {  Spinner } from "react-bootstrap";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

function LostItem() {
  const [show, setShow] = useState(false);
  const token = window.localStorage.getItem("token");
  const [loading, setloading] = useState(false);
  const [itemname, setitemname] = useState("");
  const [description, setdescription] = useState("");
  const [itemquestion, setitemquestion] = useState("");
  const [itemimage, setitemimage] = useState([]);
  const [type, settype] = useState("");

  const handleShow = () => setShow(true);

  const handleClose = () => {
    setloading(true);

    if (itemname && description && type) {
      const info = new FormData();
      info.append("name", itemname);
      info.append("description", description);
      info.append("question", itemquestion);
      info.append("type", type);
      itemimage.map((itemImage) => {
        info.append("itemPictures", itemImage, itemImage.name);
        return itemImage;
      });
      // const name=info.get('name');
      // console.log(name)
      axios({
        url: "http://localhost:5000/postitem",
        method: "POST",
        data: info,
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        onUploadProgress: (ProgressEvent) => {
          console.log(
            "Upload progress: " +
              Math.round((ProgressEvent.loaded / ProgressEvent.total) * 100) +
              "%"
          );
        },
      })
        .then((response) => {
          console.log(response.data);
        })
        .then(() => {
          showToast("Wohoo 🤩! Item listed successfully.", "success");
          setitemname("");
          setdescription("");
          settype("");
          setitemquestion("");
          setitemimage([]);
          console.log("executed")
          setloading(false);
          setShow(false);
        })
        .catch((err) => {
          setloading(false);
          console.log(err);
          showToast("Oops 😞! Check internet connection or try again later.", "error");
        });
    } else {
      showToast("Did you miss any of the required fields 🙄?", "error");
    }
  };

  const temporaryShut = () => {
    showToast("New item listing has been disabled temporarily.", "warning");
    setShow(false);
  };

  const showToast = (message, appearance) => {
    toast(message, { type: appearance });
  };

  return (
    <div>
      <Button variant="primary" onClick={handleShow}>Post Item</Button>
      <Modal show={show} onHide={() => setShow(false)} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Post item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>
                Item name<span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter item"
                value={itemname}
                onChange={(e) => setitemname(e.target.value)}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>
                Description<span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                placeholder="Enter Description"
                value={description}
                onChange={(e) => setdescription(e.target.value)}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Enter a question based on the item</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ex:- What is the color of the phone ?"
                value={itemquestion}
                onChange={(e) => setitemquestion(e.target.value)}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>
                Item type<span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Form.Control
                as="select"
                required={true}
                defaultValue="Choose..."
                onChange={(e) => settype(e.target.value)}
              >
                <option>Choose..</option>
                <option value={"Lost"}>Lost It</option>
                <option value={"Found"}>Found It</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formFileMultiple" className="mb-3">
              <Form.Label>Upload image</Form.Label>
              <Form.Control type="file" multiple onChange={(e) => setitemimage([...e.target.files])} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>Close</Button>
          <Button variant="primary" onClick={handleClose}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="sr-only">Loading...</span>
              </>
            ) : (
              <>Submit</>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default LostItem;
