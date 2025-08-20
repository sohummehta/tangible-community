import React from 'react';

const mockAssets = [
    {
      id: 'playground', 
      x: 100, 
      y: 150,
      width: 80,
      height: 40,
      color: '#FFD700'
    },
    {
      id: 'dogpark', 
      x: 300, 
      y: 200,
      width: 100,
      height: 100,
      color: 'green'
    },
    {
      id: 'restroom', 
      x: 200, 
      y: 80,
      width: 55,
      height: 30,
      color: '#ADD8E6'  
    },
];

const Mapping = () => {
    return (
        <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '4/3',
        height: 510,
        backgroundImage: 'url(/map.png)',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        border: '2px solid black',
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
            width: asset.width,
            height: asset.height,
            backgroundColor: asset.color,
            border: '2px solid gray',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            textAlign: 'center',
            color: 'black'
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
