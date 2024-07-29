import React, { useState, useEffect } from 'react';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup'; 

import './scss/style.scss';

const FormSample = () => {

    const [tableItems, setTableItems] = useState([]);
    const [updateIndex, setUpdateIndex] = useState(-1);
    const [items, setItems] = useState([]);
    const [horoscopes, setHoroscopes] = useState([
        {id: 1, name: "Aquarius"},
        {id: 2, name: "Aries"},
        {id: 3, name: "Cancer"},
        {id: 4, name: "Capricorn"},
        {id: 5, name: "Gemini"},
        {id: 6, name: "Leo"},
        {id: 7, name: "Libra"},
        {id: 8, name: "Pisces"},
        {id: 9, name: "Sagittarius"},
        {id: 10, name: "Scorpio"},
        {id: 11, name: "Taurus"},
        {id: 12, name: "Virgo"},
    ]);
    
    const validationSchema = Yup.object({
        date: Yup.date().required('Date is required'),
        name: Yup.string().oneOf(horoscopes.map(h => h.name), 'Invalid horoscope').required('Horoscope is required'),
        rating: Yup.number().min(1, 'Rating must be at least 1').max(10, 'Rating must be at most 10').required('Rating is required'),
        description: Yup.string().required('Description is required'),
    });

    useEffect(() => {
        setTableItems(
            items.map(m => ({
                name: m.name,
                rating: m.rating,
                description: m.description
            }))
        );
    }, [items]);

    const AddItems = (values, { resetForm }) => {
        debugger
        if (updateIndex === -1) {
            if (items.findIndex(a => a.name === values.name) >= 0) {
                alert("Duplicate");
                return;
            }
            setItems(prevItems => [...prevItems, values]);
        } else {
    
            const currentItem = items[updateIndex];

            if (items.findIndex(a => a.name == values.name && a != currentItem) >= 0) {
                alert("Duplicate");
                return;
            }
            const updatedItems = [...items];
            updatedItems[updateIndex] = values;
            setItems(updatedItems);
        }
        setUpdateIndex(-1);
        resetForm();
    };

    const Edit = (i, setValues) => {
        const a = items[i];
        setUpdateIndex(i);
        setValues({
            date: a.date,
            name: a.name || '',
            rating: a.rating || '',
            description: a.description || ''
        });
    };

    const DeleteItem = (i) => {
        const itemToDelete = items[i];
        const updatedItems = [...items];
        updatedItems.splice(i, 1);
        setItems(updatedItems);
        setHoroscopes(prevHoroscopes => [
            ...prevHoroscopes.filter(h => h.name !== itemToDelete.name),
            { id: horoscopes.length + 1, name: itemToDelete.name }
        ]);
    };

    const createJsonFile = () => {
        const json = JSON.stringify(tableItems, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'horoscopeData.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const tableitems = items.length;

    return (
        <Formik
            initialValues={{
                date: new Date().toISOString().substring(0, 10),
                id: '',
                name: '', 
                rating: '',
                description: ''
            }}
            validationSchema={validationSchema}
            onSubmit={AddItems}
        >
            {({ handleSubmit, errors, touched, setValues }) => (
                <Form onSubmit={handleSubmit}>
                    Date: <Field type='date' name='date' className='input-box' />
                    <br/>
                    Horoscope
                    <Field as="select" name="name" className="input-box" disabled={updateIndex !== -1} >
                        <option value="">Select Horoscope</option>
                        {horoscopes.slice().sort((a,b) => a.name.localeCompare(b.name)).map(h => (
                            <option key={h.id} value={h.name}>{h.name}</option>
                        ))}
                    </Field>
                    {errors.name && touched.name ? <div className="error">{errors.name}</div> : null}
                    <br />
                    Rating
                    <Field as="input" type="number" name="rating" className="input-box" />
                    {errors.rating && touched.rating ? <div className="error">{errors.rating}</div> : null}
                    <br />
                    Description
                    <Field as="textarea" name="description" className="input-box" />
                    {errors.description && touched.description ? <div className="error">{errors.description}</div> : null}
                    <br/>
                    <button type="submit">
                        {updateIndex === -1 ? "Add" : "Update"}
                    </button>
                    <table>
                        <thead>
                            <tr>
                                <th>Horoscope</th>
                                <th>Rating</th>
                                <th>Description</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((m, i) => (
                                <tr key={i}>
                                    <td>{m.name}</td>
                                    <td>{m.rating}</td>
                                    <td>{m.description}</td>
                                    <td>
                                        <button type="button" onClick={() => Edit(i, setValues)}>Edit</button>
                                        <button type="button" onClick={() => DeleteItem(i)}>Del</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {tableitems === 12 ? (
                        <button type='button' onClick={createJsonFile}>Submit</button>
                    ) : null}
                </Form>
            )}
        </Formik>
    );
};

export default FormSample;
