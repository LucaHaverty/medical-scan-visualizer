using System.IO;
using Dicom;
using Dicom.Imaging;
using UnityEngine;

public class DataParser : MonoBehaviour {
    const string dicomDirectory = "Assets/ScanData/Circle of Willis";
    public static DataParser Instance;
    
    // Get all DICOM files in the directory
    string[] dicomFiles = Directory.GetFiles(dicomDirectory, "*.dcm");

    public float[,,] allData;

    private void Awake() {
        Instance = this;
        
        ReadFiles();
    }

    private void ReadFiles() {
        // Look at first file for width and height
        var firstFile = DicomFile.Open(dicomFiles[0]);
        allData = new float[firstFile.Dataset.Get<int>(DicomTag.Columns) / 2,
            firstFile.Dataset.Get<int>(DicomTag.Rows) / 2, dicomFiles.Length];

        for (int i = 0; i < dicomFiles.Length; i++) {
            // Load the DICOM file
            var dicomFile = DicomFile.Open(dicomFiles[i]);

            // Extract the pixel data (voxel intensities)
            DicomPixelData pixelData = DicomPixelData.Create(dicomFile.Dataset);
            byte[] pixelBytes = pixelData.GetFrame(0).Data;

            // Convert pixel data to voxel intensities
            // Note: This assumes 8-bit grayscale pixel data
            int width = dicomFile.Dataset.Get<int>(DicomTag.Columns);
            int height = dicomFile.Dataset.Get<int>(DicomTag.Rows);

            for (int y = 0; y < height/2; y++) {
                for (int x = 0; x < width/2; x++) {
                    allData[x, y, i] = pixelBytes[y * height * 4 + x * 4] / 255.0f;
                }
            }
        }
    }
}

// OLD texture bs
/*var rend = GetComponent<SpriteRenderer>();
var tex = new Texture2D(width/2, height/2);
rend.sprite = Sprite.Create(tex, new Rect(Vector2.zero, Vector2.one * width/2), Vector2.zero);

for (int y = 0; y < height/2; y++) {
    for (int x = 0; x < width/2; x++) {
        allData[x, y, i] = pixelBytes[y * height * 4 + x * 4] / 255.0f;
    }
}
tex.Apply();*/
