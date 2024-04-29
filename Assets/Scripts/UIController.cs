using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class UIController : MonoBehaviour {
    [Header("Layer Editor")] 
    [SerializeField] private GameObject _layerEditorObj;
    
    [SerializeField] private Slider _surfCutoffSlider;
    [SerializeField] private TextMeshProUGUI _surfCutoffText;

    [SerializeField] private Slider _rSlider;
    [SerializeField] private TextMeshProUGUI _rText;
    
    [SerializeField] private Slider _gSlider;
    [SerializeField] private TextMeshProUGUI _gText;
    
    [SerializeField] private Slider _bSlider;
    [SerializeField] private TextMeshProUGUI _bText;
    
    [SerializeField] private Slider _aSldier;
    [SerializeField] private TextMeshProUGUI _aText;
    
    [SerializeField] private Slider _sampleRateSlider;
    [SerializeField] private TextMeshProUGUI _sampleRateText;

    [SerializeField] private Image _colorPreview;

    [SerializeField] private Button _generateButton;

    [SerializeField] private Button _backButton;

    [Header("Layer Selection")]
    [SerializeField] private GameObject _layerSelectionObj;

    [SerializeField] private Button _newLayerButton;
    [SerializeField] private Button _generateAllButton;
    [SerializeField] private Transform _layerParent;
    [SerializeField] private GameObject _layerPrefab;
    
    private void Awake() {
        // Back button
        _backButton.onClick.AddListener(ExitLayerEditor);
        
        // 'Generate' button
        _generateButton.onClick.AddListener(OnGenerateButtonPressed);
        
        // 'Generate All' button
        _generateAllButton.onClick.AddListener(OnGenerateAllButtonPressed);
        
        // New layer buttonS
        _newLayerButton.onClick.AddListener(AddNewLayer);
        
        // Button event listeners
        _surfCutoffSlider.onValueChanged.AddListener(OnSurfCutoffUpdate);
        _sampleRateSlider.onValueChanged.AddListener(OnSampleRateUpdate);
        
        _gSlider.onValueChanged.AddListener(_ => OnColorUpdate());
        _bSlider.onValueChanged.AddListener(_ => OnColorUpdate());
        _rSlider.onValueChanged.AddListener(_ => OnColorUpdate());
        _aSldier.onValueChanged.AddListener(_ => OnColorUpdate());

        LoadLayers();
    }

    private void InitializeSliderValues() {
        // Generation settings
        _surfCutoffSlider.value = Settings.SelectedLayer.SurfaceCutoff;
        OnSurfCutoffUpdate(_surfCutoffSlider.value);
        
        _sampleRateSlider.value = (Settings.SelectedLayer.PixelSampleRate-1f) / (Settings.MAX_SAMPLE_RATE-1f);
        OnSampleRateUpdate(_sampleRateSlider.value);
        
        // Material settings

        pauseSettingsUpdate = true;
        
        _rSlider.value = Settings.SelectedLayer.r;
        _gSlider.value = Settings.SelectedLayer.g;
        _bSlider.value = Settings.SelectedLayer.b;
        _aSldier.value = Settings.SelectedLayer.a;

        pauseSettingsUpdate = false;
        
        OnColorUpdate();
    }

    private void OnSurfCutoffUpdate(float val) {
        Settings.SelectedLayer.SurfaceCutoff = val;
        _surfCutoffText.text = (Mathf.RoundToInt(val*100f)/100f).ToString();
    }

    private void OnSampleRateUpdate(float val) {
        var currentVal = Mathf.RoundToInt(val * (Settings.MAX_SAMPLE_RATE - 1) + 1);
        Settings.SelectedLayer.PixelSampleRate = currentVal;
        _sampleRateText.text = currentVal.ToString();
    }

    private bool pauseSettingsUpdate = false;
    private void OnColorUpdate() {
        float r = _rSlider.value;
        float g = _gSlider.value;
        float b = _bSlider.value;
        float a = _aSldier.value;

        _colorPreview.color = new Color(r, g, b, a);

        if (pauseSettingsUpdate)
            return;

        Settings.SelectedLayer.r = r;
        _rText.text = (Mathf.RoundToInt(r*100f)/100f).ToString();
        Settings.SelectedLayer.g = g;
        _gText.text = (Mathf.RoundToInt(g*100f)/100f).ToString();
        Settings.SelectedLayer.b = b;
        _bText.text = (Mathf.RoundToInt(b*100f)/100f).ToString();
        Settings.SelectedLayer.a = a;
        _aText.text = (Mathf.RoundToInt(a*100f)/100f).ToString();
    }

    private void EnterLayerEditor(int index) {
        Settings.SaveData();
        Settings.SelectLayer(index);

        _layerSelectionObj.SetActive(false);
        _layerEditorObj.SetActive(true);

        InitializeSliderValues();
    }

    private void ExitLayerEditor() { 
        Settings.SaveData();
        _layerEditorObj.SetActive(false);
        _layerSelectionObj.SetActive(true);
    }

    private void OnGenerateButtonPressed() {
        Settings.SaveData();
        Controller.Instance.GenerateSelected();
    }
    
    private void OnGenerateAllButtonPressed() {
        foreach (var layer in Settings.AllLayers) {
            Settings.SelectedLayer = layer;
            Controller.Instance.GenerateSelected();
        }
    }

    private void AddNewLayer() {
        Settings.AddNewLayer();
        InstantiateLayerButton();
    }

    private void InstantiateLayerButton() {
        var newLayerObject = Instantiate(_layerPrefab, _layerParent, true);
        
        int index = _layerParent.childCount - 2;
        newLayerObject.transform.SetSiblingIndex(index);

        newLayerObject.transform.Find("Text").GetComponent<TextMeshProUGUI>().text = index.ToString();
        newLayerObject.GetComponent<Button>().onClick.AddListener(() => EnterLayerEditor(index));

        newLayerObject.transform.localScale = Vector3.one;
    }

    private void LoadLayers() {
        foreach (var _ in Settings.AllLayers) {
            InstantiateLayerButton();
        }
    }
}
