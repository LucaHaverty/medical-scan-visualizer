using System.Collections.Generic;
using System.IO;
using UnityEditor;
using UnityEngine;

public static class Settings {
    private const string FILE_PATH = "Assets/VisualizerData/Data.json";
    public const int MAX_SAMPLE_RATE = 10;

    public static VisualizerLayer SelectedLayer;

    public static readonly List<VisualizerLayer> AllLayers = new();

    static Settings() {
        LoadData();
        SaveData();
    }

    public static void SelectLayer(int index) {
        if (index >= AllLayers.Count) {
            Debug.LogError($"LAYER {index} DOES NOT EXIST!");
            return;
        }

        SelectedLayer = AllLayers[index];
    }

    public static void RemoveLayer(int index) {
        if (index >= AllLayers.Count) {
            Debug.LogError($"LAYER {index} DOES NOT EXIST!");
            return;
        }

        AllLayers.Remove(AllLayers[index]);
    }

    public static void AddNewLayer() {
        var newLayer = new VisualizerLayer();
        AllLayers.Add(newLayer);
    }

    [System.Serializable]
    public class VisualizerLayer {
        public float SurfaceCutoff = 0.5f;
        public int PixelSampleRate;

        public float r = 0.5f;
        public float g = 0.5f;
        public float b = 0.5f;
        public float a = 1f;

        public string Guid;

        public VisualizerLayer() {
            Guid = GUID.Generate().ToString();
        }
    }

    [System.Serializable]
    public class VisualizerData {
        public VisualizerLayer[] layers;

        public VisualizerData(VisualizerLayer[] layers) {
            this.layers = layers;
        }
    }

    private static void LoadData() {
        if (!File.Exists(FILE_PATH))
            return;

        var data = JsonUtility.FromJson<VisualizerData>(File.ReadAllText(FILE_PATH));
        

        if (data?.layers == null) 
            return;

        foreach (var layer in data.layers) {
            AllLayers.Add(layer);
        }
    }

    public static void SaveData() {
        File.WriteAllText(FILE_PATH, 
            JsonUtility.ToJson(new VisualizerData(AllLayers.ToArray())));
    }
}