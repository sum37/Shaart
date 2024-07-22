import React from 'react';
import Card from './Card';
import './CardContainer.css';

const CardContainer = () => {
  const cards = [
    {
      icon: '📘',
      title: 'Training course',
      description: "Improve students' ability level through training courses",
      price: '$36',
      daysLeft: '2'
    },
    {
      icon: '🎥',
      title: 'Live course',
      description: "Improve students' ability level through live courses",
      price: '$28',
      daysLeft: '3'
    },
    {
      icon: '📺',
      title: 'Video course',
      description: "Improve students' ability level through video courses",
      price: '$15',
      daysLeft: '3'
    },
    {
      icon: '📻',
      title: 'Radio course',
      description: "Improve student ability through single-choice courses",
      price: '$18',
      daysLeft: '2'
    },
    {
      icon: '📦',
      title: 'Package course',
      description: "Improve student abilities through package courses",
      price: '$25',
      daysLeft: '3'
    },
    {
      icon: '🔄',
      title: 'Other course',
      description: "Improve students' abilities through other courses",
      price: '$28',
      daysLeft: '3'
    }
  ];

  return (
    <div className="card-container">
      {cards.map((card, index) => (
        <Card
          key={index}
          icon={card.icon}
          title={card.title}
          description={card.description}
          price={card.price}
          daysLeft={card.daysLeft}
        />
      ))}
    </div>
  );
};

export default CardContainer;
