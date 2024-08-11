import React, { useState, useEffect } from 'react';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import { useSelector } from 'react-redux';
import { useColorModes } from '@coreui/react';
import { CFormInput, CFormSelect, CFormTextarea, CButton, CTable, CTableBody, CTableHeaderCell, CTableRow, CTableDataCell } from '@coreui/react';
import '/src/scss/style.scss';
import { useNavigate, useLocation } from 'react-router-dom';

const DailyUpdate = () => {
    const [tableItems, setTableItems] = useState([]);
    const [updateIndex, setUpdateIndex] = useState(-1);
    const [items, setItems] = useState([]);
    const [horoscopes, setHoroscopes] = useState([]);
    const [initialValues, setInitialValues] = useState({
        date: new Date().toISOString().substring(0, 10),
        id: '',
        name: '',
        rating: '',
        description: ''
    });

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetch("http://52.66.24.172:7001/DailyRashiUpdates/LoadBaseData")
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                setHoroscopes(data.data.rashi);
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    }, []);

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const id = urlParams.get('id');
        if (id) {
            fetch(`http://52.66.24.172:7001/DailyRashiUpdates/Get?id=${id}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok ' + response.statusText);
                    }
                    return response.json();
                })
                .then(data => {
                    const fetchedItem = data.data.item;
                    const mappedItems = fetchedItem.items.map(item => {
                        const matchingHoroscope = horoscopes.find(h => h.id === String(item.rashi_id));
                        return {
                            id: item.rashi_id,
                            name: matchingHoroscope?.name || '',
                            rating: item.rating,
                            description: item.description
                        };
                    });
                    setItems(mappedItems);
                    setInitialValues({
                        date: fetchedItem.transaction_date,
                        id: fetchedItem._id,
                        name: '',
                        rating: '',
                        description: ''
                    });
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                });
        }
    }, [location.search, horoscopes]);

    const validationSchema = Yup.object({
        date: Yup.date().required('Date is required'),
        name: Yup.string().oneOf(horoscopes.map(h => h.name), 'Invalid horoscope').required('Horoscope is required'),
        rating: Yup.number().min(1, 'Rating must be at least 1').max(10, 'Rating must be at most 10').required('Rating is required'),
        description: Yup.string().required('Description is required'),
    });

    useEffect(() => {
        setTableItems(items.map(m => ({
            id: m.id,
            date: m.date,
            name: m.name,
            rating: m.rating,
            description: m.description
        })));
    }, [items]);

    const AddItems = (values, { resetForm }) => {
        const selectedHoroscope = horoscopes.find(h => h.name === values.name);
    
        if (!selectedHoroscope) {
            alert("Invalid horoscope selected");
            return;
        }
    
        const newItem = {
            id: selectedHoroscope.id,
            name: values.name,
            rating: values.rating,
            description: values.description
        };
    
        if (updateIndex === -1) {
            if (items.findIndex(a => a.name === values.name) >= 0) {
                alert("Duplicate");
                return;
            }
            setItems(prevItems => [...prevItems, newItem]);
        } else {
            const updatedItems = [...items];
            updatedItems[updateIndex] = newItem;
            setItems(updatedItems);
        }
    
        setUpdateIndex(-1);
        resetForm();
    };
    

    const DeleteItem = (i) => {
        const updatedItems = [...items];
        updatedItems.splice(i, 1);
        setItems(updatedItems);
    };

    const updateList = () => {
        const payload = {
            _id: initialValues.id,
            transaction_date: initialValues.date,
            items: items.map(item => ({
                rashi_id: item.id,
                rating: item.rating,
                description: item.description
            }))
        };
    
        const payload1 = {
            transaction_date: initialValues.date,
            items: items.map(item => ({
                rashi_id: item.id,
                rating: item.rating,
                description: item.description
            }))
        };
    
        const urlPath = location.pathname + location.search;

        if (urlPath.includes('/manage') && !location.search) {
            fetch('http://52.66.24.172:7001/DailyRashiUpdates/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload1)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok ' + response.statusText);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Successfully posted to the API:', data);
                    navigate('/dailyupdate/list');
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                });
        } else if (urlPath.includes('/manage') && location.search) {
            fetch('http://52.66.24.172:7001/DailyRashiUpdates/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok ' + response.statusText);
                    }
                    return response.json();
                })
                .then(data => {
                    navigate('/dailyupdate/list');
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                });
        }
    };
    

    const navtolist = () => {
        navigate('/dailyupdate/list');
    }

    const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme');
    const storedTheme = useSelector((state) => state.theme);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0];
        if (theme) {
            setColorMode(theme);
        }

        if (isColorModeSet()) {
            return;
        }

        setColorMode(storedTheme);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <Formik
            initialValues={initialValues}
            enableReinitialize
            validationSchema={validationSchema}
            onSubmit={AddItems}
        >
            {({ handleSubmit, errors, touched, setValues }) => (
                <>
                    <Form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <CButton onClick={navtolist} color='primary'>Back to List</CButton><br /><br />
                            <label htmlFor="date">Date</label>
                            <Field as={CFormInput} type='date' id='date' name='date' />
                            {errors.date && touched.date && <div className="text-danger">{errors.date}</div>}
                        </div>
                        <div className="mb-3">
                            <label htmlFor="name">Horoscope</label>
                            <Field as={CFormSelect} name="name" id="name" disabled={updateIndex !== -1}>
                                <option value="">Select Horoscope</option>
                                {horoscopes.slice().sort((a, b) => a.name.localeCompare(b.name)).map(h => (
                                    <option key={h.id} value={h.name}>{h.name}</option>
                                ))}
                            </Field>
                            {errors.name && touched.name && <div className="text-danger">{errors.name}</div>}
                        </div>
                        <div className="mb-3">
                            <label htmlFor="rating">Rating</label>
                            <Field as={CFormInput} type="number" id="rating" name="rating" />
                            {errors.rating && touched.rating && <div className="text-danger">{errors.rating}</div>}
                        </div>
                        <div className="mb-3">
                            <label htmlFor="description">Description</label>
                            <Field as={CFormTextarea} id="description" name="description" />
                            {errors.description && touched.description && <div className="text-danger">{errors.description}</div>}
                        </div>
                        <CButton type="submit" color="primary">
                            {updateIndex === -1 ? "Add" : "Update"}
                        </CButton>
                    </Form>

                    <CTable hover>
                        <thead>
                            <CTableRow>
                                <CTableHeaderCell>Horoscope</CTableHeaderCell>
                                <CTableHeaderCell>Rating</CTableHeaderCell>
                                <CTableHeaderCell>Description</CTableHeaderCell>
                                <CTableHeaderCell>Action</CTableHeaderCell>
                            </CTableRow>
                        </thead>
                        <CTableBody>
                            {items.map((m, i) => (
                                <CTableRow key={i}>
                                    <CTableDataCell>{m.name}</CTableDataCell>
                                    <CTableDataCell>{m.rating}</CTableDataCell>
                                    <CTableDataCell>{m.description}</CTableDataCell>
                                    <CTableDataCell>
                                        <CButton color="warning" onClick={() => {
                                            setValues({
                                                date: initialValues.date,
                                                name: m.name || '',
                                                rating: m.rating || '',
                                                description: m.description || ''
                                            });
                                            setUpdateIndex(i);
                                        }}>Edit</CButton>
                                        <CButton color="danger" onClick={() => DeleteItem(i)}>Delete</CButton>
                                    </CTableDataCell>
                                </CTableRow>
                            ))}
                        </CTableBody>
                    </CTable>
                    {tableItems.length === 12 && (
                        <></>
                    )}
                    <CButton color="success" onClick={updateList}>Submit</CButton>
                </>
            )}
        </Formik>
    );
};

export default DailyUpdate;
