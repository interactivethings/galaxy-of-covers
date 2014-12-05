import nltk
import os

storyText = open('story.txt', 'r')
preparedLines = []
corpus = ""
for line in storyText:
  preparedLines.append(line.replace('\n', ''))
  corpus += " " + preparedLines[-1]

print(corpus)
