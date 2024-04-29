using UnityEngine;

public class Controller : MonoBehaviour {
    public static Controller Instance;

    private void Awake() { Instance = this; }

    
    [SerializeField] private Material _transparentGreenMat;
    [SerializeField] private Material _redMat;
    void Start() {
        /*Grid grid = new Grid(Vector3.zero, new Vector3Int(DataParser.Instance.allData.GetLength(0),DataParser.Instance.allData.GetLength(2),DataParser.Instance.allData.GetLength(1)), 1, 
            0.05f, new Vector3(4000, 1000,1000), 0.7f);*/

        //_meshFilter.mesh = MeshGenerator.GenerateMesh(grid);
        //GenerateArteryTransparent();
    }

    public void GenerateSelected() {
        Grid grid = new Grid(Vector3.zero, new Vector3Int(DataParser.Instance.allData.GetLength(0),
            DataParser.Instance.allData.GetLength(2), DataParser.Instance.allData.GetLength(1)), 1);

        Material mat = new Material(Shader.Find("Transparent/Diffuse"));

        // Set the color and transparency of the material
        mat.color = new Color(Settings.SelectedLayer.r, Settings.SelectedLayer.g, Settings.SelectedLayer.b,
            Settings.SelectedLayer.a);

        Transform obj;

        if (transform.Find(Settings.SelectedLayer.Guid) != null) {
            obj = transform.Find(Settings.SelectedLayer.Guid);
        }
        else {
            obj = GameObject.CreatePrimitive(PrimitiveType.Cube).transform;
            obj.name = Settings.SelectedLayer.Guid;
        }

        obj.parent = transform;
        obj.GetComponent<MeshRenderer>().material = mat;
        obj.GetComponent<MeshFilter>().mesh = MeshGenerator.GenerateMesh(grid);
    }

    /*public void GenerateArteryTransparent() {
        Settings.SelectedLayer.SurfaceCutoff = 0.7f;
        Grid grid = new Grid(Vector3.zero, new Vector3Int(DataParser.Instance.allData.GetLength(0),
            DataParser.Instance.allData.GetLength(2),DataParser.Instance.allData.GetLength(1)), 1);

        _meshFilter.mesh = MeshGenerator.GenerateMesh(grid);
        _meshRend.material = _transparentGreenMat;
        
        GameObject arteriesObj = GameObject.CreatePrimitive(PrimitiveType.Cube);
        Settings.SelectedLayer.SurfaceCutoff = 0.5f;
        grid = new Grid(Vector3.zero, new Vector3Int(DataParser.Instance.allData.GetLength(0),
            DataParser.Instance.allData.GetLength(2),DataParser.Instance.allData.GetLength(1)), 1);

        arteriesObj.GetComponent<MeshFilter>().mesh = MeshGenerator.GenerateMesh(grid);
        arteriesObj.GetComponent<MeshRenderer>().material = _redMat;
    }*/
}
