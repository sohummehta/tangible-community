import React from 'react';

const mockAssets = [
    {id: 'playground', x: 100, y: 150},
    {id: 'dogpark', x: 300, y: 200},
    {id: 'restroom', x: 200, y: 80},
];

const Mapping = () => {
    return (
        <div
      style={{
        position: 'relative',
        width: 600,
        height: 600,
        border: '2px solid red',
        margin: '0 auto',
        marginTop: 20,
      }}
    >
      {mockAssets.map((asset) => (
        <div
          key={asset.id}
          style={{
            position: 'absolute',
            top: asset.y,
            left: asset.x,
            width: 50,
            height: 50,
            backgroundColor: 'lightblue',
            border: '1px solid gray',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            textAlign: 'center',
          }}
        >
          {asset.id}
        </div>
      ))}
    </div>
    )
}
/*function Mapping() {
    return (
        <div>
            <h1>Mapping</h1>
        </div>
    )
}
*/
export default Mapping;
