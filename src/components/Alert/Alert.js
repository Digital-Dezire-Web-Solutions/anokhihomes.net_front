import React from 'react'
import './Alert.css'
import NiTick from '../../icons/ni-tick'
import NiCross from '../../icons/ni-cross'
import NiInfo from '../../icons/ni-info'

const Alert = ({ item }) => {
    return (
        <div className={`Alert ${item ? "active" : ""}`}>
            {item?.status === "Success" ? (
                <p className='Alert success'> <NiTick /> {item?.message}</p>
            ) : item?.status === "Error" ? (
                <p className='Alert danger'><NiCross />{item?.message}</p>
            ) : (
                <p className='Alert warning'><NiInfo />{item?.message}</p>
            )}
        </div>
    )
}

export default Alert
