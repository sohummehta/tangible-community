import cv2
import numpy as np

dictionary = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_6X6_250)

IDNumber = input("Please enter the ID number of the ArUco marker. Press q to quit: ")
while (IDNumber != 'q'):
    int_ID = int(IDNumber)
    markerImage = cv2.aruco.generateImageMarker(dictionary,int_ID,200)
    cv2.imwrite(f"marker{int_ID}.png",markerImage)
    IDNumber = input("Please enter the ID number of the ArUco marker. Press q to quit: ")
