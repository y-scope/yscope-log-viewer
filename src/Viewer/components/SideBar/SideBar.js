import React, { useEffect, useRef, useState, useContext } from "react";
import { Form } from 'react-bootstrap';
import STATE_CHANGE_TYPE from "../../services/STATE_CHANGE_TYPE";
import { Resizable } from "re-resizable";
import { Search } from "react-bootstrap-icons";
import { ThemeContext } from "../../../ThemeContext/ThemeContext";
import { THEME_STATES } from "../../../ThemeContext/THEME_STATES";
import "./SideBar.scss";


export function SideBar({ changeStateCallback, searchResults, clickItemCallback }) {
    const theme = useContext(ThemeContext);
    const textareaRef = useRef(null);
    const [content, setContent] = useState("");
    const [selectItem, setSelectItem] = useState(false);

    useEffect(() => {
        if (textareaRef.current) {
            console.log(textareaRef.current.scrollHeight)
            textareaRef.current.style.height = '10pt'; // Reset height before calculating the new height
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [content, selectItem]);

    const handleInputChange = (e) => {
        changeStateCallback(STATE_CHANGE_TYPE.search, { searchString: e.target.value });
        setContent(e.target.value);
    };

    const getColor = () => {
        if (theme.theme === "dark") {
            return 'white'
        } else {
            return 'black'
        }
    }

    const numSearchResults = searchResults.reduce((acc, curr) => acc + curr.searchResults.length, 0);

    const listOfSearchResults = searchResults.map((result, index) => {
        return (
            <div key={index}>
                <h6 style={{ color: getColor() }}>Page {result.page_num + 1}</h6>
                <ul style={{ whiteSpace: 'nowrap', listStyleType: 'none' }}>
                    {result.searchResults.map((line, index) => (
                        <li key={index} onClick={() => clickItemCallback(line.eventIndex + 1)} style={{
                            fontSize: "10pt", padding: "1pt", cursor: 'pointer',
                            color: '#007bff'
                        }}>{line.content}</li>
                    ))}
                </ul>
            </div>
        )
    })

    return (
        // <div className="side-bar" >
        // <div className="side-bar-navigation" style={{width: 100, backgroundColor: 'white'}} >
        // <Search/>
        // </div>
        <div className="d-flex h-100 flex-row">
            <div className="h-100" >
                <Search className="search-icon" style={{ color: getColor() }} onClick={() => { if (selectItem === false) setSelectItem(true); else setSelectItem(false); }} />
            </div>
            {
                selectItem && <Resizable
                    onResizeStop={(e, direction, ref, d) => {
                        if (textareaRef.current) {
                            console.log(textareaRef.current.scrollHeight)
                            textareaRef.current.style.height = '10pt'; // Reset height before calculating the new height
                            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
                        }
                    }}
                    defaultSize={{
                        width: 300,
                        height: '100%',
                    }}
                    handleClasses={{
                        top: "pointer-events-none",
                        bottom: "pointer-events-none",
                        left: "pointer-events-none",
                        topRight: "pointer-events-none",
                        bottomRight: "pointer-events-none",
                        bottomLeft: "pointer-events-none",
                        topLeft: "pointer-events-none",
                    }}

                >
                        <div className="d-flex h-100 flex-column" data-theme={theme}>
                            <div className="side-bar-search__header">
                                <div className="side-bar-search__header__title" style={{ color: getColor() }}>
                                    <h4>Search</h4>
                                </div>
                            </div>
                            <Form>
                                <Form.Group controlId="formSearchString">
                                    {/* <Form.Label>Search String</Form.Label> */}
                                    <Form.Control
                                        as="textarea"
                                        // height="auto"
                                        ref={textareaRef}
                                        type="text"
                                        value={content}
                                        onChange={handleInputChange}
                                        style={{ overflow: 'hidden' }}
                                    />
                                </Form.Group>
                            </Form>
                            <div className="flex-fill h-100 overflow-auto" style={{marginTop: "10pt"}}>
                                {listOfSearchResults}
                            </div>
                        </div>

                </Resizable>
            }
        </div>
    );
}
