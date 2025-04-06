import React from 'react';
import { NavLink } from 'react-router-dom';
import '../App.css';

const projects = [
    {
        title: "Assignment 0: Dummy python script",
        description: "This assignment is a dummy script to test if the website correctly redirects the user to the GitHub repository of the assignment.",
        link: "https://github.com/Shangmin-Chen/shangmin-assignment-0"
    },
    {
        title: "Assignment 1: Data Collection and Analysis",
        description: "This assignment requires CS 506 students to collect data elevator arrival times in CDS in the span of 4 days. Then conduct analysis on where is the most optimal location to stand based on probability of doors opening.",
        link: "https://github.com/Shangmin-Chen/shangmin-assignment-1"
    },
    {
        title: "Assignment 2: KMeans Clustering Visualization Webpage",
        description: "In this assignment, you will develop an interactive web application that demonstrates the KMeans clustering algorithm using various initialization methods. This project allows you to explore the impact of different initialization strategies on the clustering outcome.",
        link: "https://github.com/Shangmin-Chen/shangmin-assignment-2"
    },
    {
        title: "Assignment 3: SVD analysis",
        description: "This assignment we did analysis on SVD's effect on the computation time with mnist database.",
        link: "https://github.com/Shangmin-Chen/shangmin-assignment-3"
    },
    {
        title: "Assignment 4: Latent Semantic Analysis",
        description: "Developed an interactive web application that implements a basic search engine using Latent Semantic Analysis (LSA). The search engine will take a user’s query, perform LSA on a pool of documents, and return the top documents based on cosine similarity.",
        link: "https://github.com/Shangmin-Chen/shangmin-assignment-4"
    },
    {
        title: "Assignment 5: K Nearest Neighbors",
        description: "Developed a K-Nearest Neighbors (KNN) model from scratch to predict customer churn for a bank. Your goal is to identify customers who are likely to leave the bank based on historical data and submit your predictions in a mini Kaggle competition.",
        link: "https://github.com/Shangmin-Chen/shangmin-assignment-5"
    },
    {
        title: "Midterm",
        description: "Midterm kaggle competition",
        link: "https://github.com/Shangmin-Chen/cs506-midterm"
    },
    {
        title: "Assignment 6: Linear Regression",
        description: "Developed a Linear Regression visualizer that visualizes random data while letting user tune parameters like Sample Size, Mean, Variance, and Number of Simulations.",
        link: "https://github.com/Shangmin-Chen/shangmin-assignment-6"
    },
    {
        title: "Assignment 7: Hypothesis Testing and Confidence Intervals in Linear Regression",
        description: "Extend my previous work from Assignment 6 to include hypothesis testing and confidence intervals through simulations. Enhance the interactive webpage to allow users to perform hypothesis tests on the slope or intercept of the regression line and generate confidence intervals based on simulations.",
        link: "https://github.com/Shangmin-Chen/shangmin-assignment-7"
    },
    {
        title: "Assignment 8: Logistic Regression",
        description: "Explore the effect of shifting clusters in a dataset on the parameters of a logistic regression model.",
        link: "https://github.com/Shangmin-Chen/shangmin-assignment-8"
    },
    {
        title: "Assignment 9: Neural Networks",
        description: "Implement and analyze a simple neural network by visualizing its learned features, decision boundary, and gradients. The goal is to develop a deeper understanding of how a Feedforward Neural Network with one hidden layer operates and represents the input space during learning.",
        link: "https://github.com/Shangmin-Chen/shangmin-assignment-9"
    },
    {
        title: "Extra Credit",
        description: "Extra Credit kaggle competition.",
        link: "https://github.com/Shangmin-Chen/cs506-ec"
    }
];

const MiniDataProjects = () => {
    return (
        <div className="miniDataProjects">
            <nav>
                <NavLink to="/" exact activeClassName="active">Home</NavLink>
                <NavLink to="/miniDataProjects" activeClassName="active">Data ML Projects</NavLink>
                <NavLink to="/contact" activeClassName="active">Contact</NavLink>
            </nav>
            <h1>Data ML Projects</h1>
            <div className="projects-list">
                {projects.map((project, index) => (
                    <div key={index} className="project-item">
                        <h2>{project.title}</h2>
                        <p>{project.description}</p>
                        <a href={project.link} target="_blank" rel="noopener noreferrer">View Project</a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MiniDataProjects;
